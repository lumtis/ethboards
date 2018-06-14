pragma solidity ^0.4.2;

contract TimeoutManager {

    address serverAddress;
    uint timeoutThreshold;

    mapping (uint => uint8) currentTimeoutPlayer;
    mapping (uint => uint) currentTimeoutTurn;
    mapping (uint => uint) currentTimeoutTimestamp;
    mapping (uint => address) currentTimeoutClaimer;

    // Used to avoid not shared turn attack
    // matchId => turnIndex => turnKey (0-3) => value
    mapping (uint => mapping (uint8 => mapping (uint8 => uint8))) lastMoves;

    // Last signature
    mapping (uint => mapping (uint8 => mapping bytes32)) lastR;
    mapping (uint => mapping (uint8 => mapping bytes32)) lastS;
    mapping (uint => mapping (uint8 => mapping uint8)) lastV;

    // 0 - 8
    uint8 lastMovesNb;


    function TimeoutManager() public {
        // 300 sec = 5 min
        timeoutThreshold = 300;
        serverAddress = address(0);
        lastMovesNb = 0;
    }

    function changeTimeoutThreshold(uint threshold) public onlyOwner {
        timeoutThreshold = threshold;
    }


    function isTimeout(uint indexServer) public view returns(bool isRet) {
        require(indexServer < serverNumber);
        return (servers[indexServer].currentTimeoutTimestamp > 0);
    }

    function timeoutInfos(uint indexServer) public view returns(uint8 timeoutPlayerRet, uint timeoutTurnRet, uint timeoutTimestampRet, address timeoutClaimerRet) {
        require(indexServer < serverNumber);
        require(servers[indexServer].currentTimeoutTimestamp > 0);

        return (servers[indexServer].currentTimeoutPlayer, servers[indexServer].currentTimeoutTurn, servers[indexServer].currentTimeoutTimestamp, servers[indexServer].currentTimeoutClaimer);
    }

    function getLastMoves(uint indexServer) public view returns(uint8[8][4] moveRet) {
        require(indexServer < serverNumber);

        return servers[indexServer].lastMoves;
    }

    // Called by anybody to start a timeout process against the player
    function startTimeout(
      uint indexServer
      uint[3][8] metadata
      uint8[4][8] move
      uint[176][8] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
      ) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].currentTimeoutTimestamp == 0);
        require(servers[indexServer].playerIndex[msg.sender] > 0);

        if(nbSignature == 0) {
            // First turn to time out
            require(servers[indexServer].currentTimeoutTurn == 0 && servers[indexServer].currentTimeoutPlayer == 0);
            servers[indexServer].currentTimeoutTimestamp = now;
            servers[indexServer].currentTimeoutClaimer = msg.sender;
        }
        else {
            // Not the first turn
            require(metadata[0][0] == servers[indexServer].currentMatchId-1);
            require(metadata[0][2] < servers[indexServer].playerMax);

            // Check if it is the first turn
            // During first turn not all alive player are required to be part of the signatures list
            if(metadata[0][1] == 0 && metadata[0][2] == 0) {
                originState = getInitialState(indexServer);
            }
            else {
                require(nbSignature == servers[indexServer].playerNb);
            }

            // Verify all signatures
            for(uint8 i=0; i<nbSignature; i++) {

                // Check if this turn has been timed out
                if(matchTimeoutTurns[metadata[i][0]][metadata[i][1]][metadata[i][2]]) {
                    if(i == 0) {
                        uint[176] memory simulatedTurn = kill(originState, uint8(metadata[i][2]));
                    }
                    else {
                        simulatedTurn = kill(moveOutput[i-1], uint8(metadata[i][2]));
                    }
                }
                else {
                    // Verify that the move have been signed by the player
                    require(moveOwner(metadata[i], move[i], moveOutput[i], r[i], s[i], v[i]) == servers[indexServer].players[uint8(metadata[i][2])].owner);

                    // Simulate the turn and verify the simulated output is the given output
                    if(i == 0) {
                        simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], originState);
                    }
                    else {
                        simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], moveOutput[i-1]);
                    }
                }

                // Check integrity
                require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

                // If not the last turn check the next turn is correctly the next player
                uint[3] memory newMetadata = nextTurn(indexServer, metadata[i], moveOutput[i]);
                require(newMetadata[0] == metadata[i+1][0]);
                require(newMetadata[1] == metadata[i+1][1]);
                require(newMetadata[2] == metadata[i+1][2]);

                // Set lastMove to be sure state is shared
                servers[indexServer].lastMoves[i][0] = move[i][0];
                servers[indexServer].lastMoves[i][1] = move[i][1];
                servers[indexServer].lastMoves[i][2] = move[i][2];
                servers[indexServer].lastMoves[i][3] = move[i][3];
            }

            // Set timeout attribute
            // Last metadata is last player
            require(newMetadata[1] > servers[indexServer].currentTimeoutTurn || (newMetadata[1] == servers[indexServer].currentTimeoutTurn && newMetadata[2] >= servers[indexServer].currentTimeoutPlayer));
            servers[indexServer].currentTimeoutPlayer = uint8(newMetadata[2]);
            servers[indexServer].currentTimeoutTurn = newMetadata[1];
            servers[indexServer].currentTimeoutTimestamp = now;
            servers[indexServer].currentTimeoutClaimer = msg.sender;
        }

    }

    // Called by playing player to stop the timeout against him
    // He has to show he had played the turn
    // The last turn will be incremented
    // Only his signature is suficient (startTimeout imply last signature have been verified)
    function stopTimeout(
      uint indexServer
      uint[3][8] metadata,
      uint8[4][8] move,
      uint[176][8] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
      ) public {
        require(indexServer < serverNumber);
        require(nbSignature > 0);
        require(servers[indexServer].currentTimeoutTimestamp > 0);
        require(metadata[0][0] == servers[indexServer].currentMatchId-1);
        require(metadata[0][2] < servers[indexServer].playerMax);
        require(servers[indexServer].playerIndex[msg.sender] == servers[indexServer].currentTimeoutPlayer);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            originState = getInitialState(indexServer);
        }
        else {
            require(nbSignature == servers[indexServer].playerNb);
        }

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Check if this turn has been timed out
            if(matchTimeoutTurns[metadata[i][0]][metadata[i][1]][metadata[i][2]]) {
                if(i == 0) {
                    uint[176] memory simulatedTurn = kill(originState, uint8(metadata[i][2]));
                }
                else {
                    simulatedTurn = kill(moveOutput[i-1], uint8(metadata[i][2]));
                }
            }
            else {
                // Verify that the move have been signed by the player
                require(moveOwner(metadata[i], move[i], moveOutput[i], r[i], s[i], v[i]) == servers[indexServer].players[uint8(metadata[i][2])].owner);

                // Simulate the turn and verify the simulated output is the given output
                if(i == 0) {
                    simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], originState);
                }
                else {
                    simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], moveOutput[i-1]);
                }
            }

            // Check integrity
            require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

            // If not the last turn check the next turn is correctly the next player
            uint[3] memory newMetadata = nextTurn(indexServer, metadata[i], moveOutput[i]);
            require(newMetadata[0] == metadata[i+1][0]);
            require(newMetadata[1] == metadata[i+1][1]);
            require(newMetadata[2] == metadata[i+1][2]);

            // Set lastMove to be sure state is shared
            servers[indexServer].lastMoves[i][0] = move[i][0];
            servers[indexServer].lastMoves[i][1] = move[i][1];
            servers[indexServer].lastMoves[i][2] = move[i][2];
            servers[indexServer].lastMoves[i][3] = move[i][3];
        }

        // Set new value to timeout to avoid time out stressing
        require(newMetadata[1] > servers[indexServer].currentTimeoutTurn || (newMetadata[1] == servers[indexServer].currentTimeoutTurn && newMetadata[2] > servers[indexServer].currentTimeoutPlayer));
        servers[indexServer].currentTimeoutPlayer = uint8(newMetadata[2]);
        servers[indexServer].currentTimeoutTurn = newMetadata[1];
        servers[indexServer].currentTimeoutTimestamp = 0;

    }


    // Called by anybody to confirm a timeout process
    // The player hasn't played his turn in time, he's kicked
    function confirmTimeout(uint indexServer) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].currentTimeoutTimestamp > 0);
        require(servers[indexServer].currentTimeoutTimestamp + timeoutThreshold > now);

        // Claimer get money
        servers[indexServer].currentTimeoutClaimer.transfer(servers[indexServer].moneyBag + cheatWarrant);

        // Kick blamed player
        removePlayer(indexServer, servers[indexServer].currentTimeoutPlayer);

        // register timeout
        uint matchId = servers[indexServer].currentMatchId - 1;
        uint turn = servers[indexServer].currentTimeoutTurn;
        uint playerTurn = servers[indexServer].currentTimeoutPlayer;
        matchTimeoutTurns[matchId][turn][playerTurn] = true;

        /// Reset timeout
        servers[indexServer].currentTimeoutTimestamp = 0;
    }
}
