pragma solidity ^0.4.2;


import "./NujaBattle.sol";
import "./StateManager.sol";


contract TimeoutManager {

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    address owner;
    address serverAddress;
    uint timeoutThreshold;

    // Information about the current timeout
    mapping (uint => uint8) currentTimeoutPlayer;
    mapping (uint => uint) currentTimeoutTurn;
    mapping (uint => uint) currentTimeoutTimestamp;
    mapping (uint => address) currentTimeoutClaimer;

    // Store player timed out for front-end code
    mapping (uint => uint8) nbTimeout;
    mapping (uint => mapping (uint8 => uint)) timeoutTurn;
    mapping (uint => mapping (uint8 => uint8)) timeoutPlayer;

    // Used to avoid not shared turn attack
    // matchId => turnIndex => turnKey (0-3) => value
    mapping (uint => mapping (uint8 => mapping (uint8 => uint8))) lastMoves;

    // Last signature
    mapping (uint => mapping (uint8 => bytes32)) lastR;
    mapping (uint => mapping (uint8 => bytes32)) lastS;
    mapping (uint => mapping (uint8 => uint8)) lastV;

    // Used to let the front-end code adding the missing last moves
    mapping (uint =>  mapping (uint8 => uint)) lastMovesTurn;
    mapping (uint =>  mapping (uint8 => uint8)) lastMovesPlayer;

    // 0 - 8
    mapping (uint => uint8) lastMovesNb;



    function TimeoutManager() public {
        owner = msg.sender;
        // 300 sec = 5 min
        timeoutThreshold = 1200;
        serverAddress = 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0;
    }

    function changeTimeoutThreshold(uint threshold) public onlyOwner {
        timeoutThreshold = threshold;
    }

    function getTimeoutThreshold() public view returns (uint thresholdRet) {
        return timeoutThreshold;
    }

    function isTimeout(uint matchId) public view returns(bool isRet) {
        return (currentTimeoutTimestamp[matchId] > 0);
    }

    function timeoutInfos(uint matchId) public view returns(uint8 timeoutPlayerRet, uint timeoutTurnRet, uint timeoutTimestampRet, address timeoutClaimerRet) {
        require(isTimeout(matchId));

        return (currentTimeoutPlayer[matchId], currentTimeoutTurn[matchId], currentTimeoutTimestamp[matchId], currentTimeoutClaimer[matchId]);
    }

    function getLastMoves(uint matchId) public view returns(uint8[4][8] moveRet, uint8 nbRet) {
        require(isTimeout(matchId));

        uint8[4][8] memory ret;

        for(uint8 i; i<8; i++) {
            for(uint8 j; j<4; j++) {
                ret[i][j] = lastMoves[matchId][i][j];
            }
        }

        return (ret, lastMovesNb[matchId]);
    }

    function getLastMovesSignature(uint matchId) public view returns(bytes32[8] lastRRet, bytes32[8] lastSRet, uint8[8] lastVRet) {
        require(isTimeout(matchId));

        bytes32[8] memory Rret;
        bytes32[8] memory Sret;
        uint8[8] memory Vret;

        for(uint8 i; i<8; i++) {
            Rret[i] = lastR[matchId][i];
            Sret[i] = lastS[matchId][i];
            Vret[i] = lastV[matchId][i];
        }

        return (Rret, Sret, Vret);
    }

    function getLastMovesMetadata(uint matchId) public view returns(uint[8] turnRet, uint8[8] playerRet) {
        require(isTimeout(matchId));

        uint[8] memory turn;
        uint8[8] memory player;

        for(uint8 i; i<8; i++) {
            turn[i] = lastMovesTurn[matchId][i];
            player[i] = lastMovesPlayer[matchId][i];
        }

        return (turn, player);
    }

    function getTimeoutPlayers(uint matchId) public view returns(uint8 nbTimeoutRet, uint[8] timeoutTurnRet, uint8[8] timeoutPlayerRet) {
        uint[8] memory turns;
        uint8[8] memory players;

        // Fill turn and player turn
        for(uint8 i=0; i<nbTimeout[matchId]; i++) {
            turns[i] = timeoutTurn[matchId][i];
            players[i] = timeoutPlayer[matchId][i];
        }

        // Fill remaining data
        for(;i<8;i++) {
            turns[i] = 0;
            players[i] = 0;
        }

        return (nbTimeout[matchId], turns, players);
    }


    // Called by anybody to start a timeout process against the player
    function startTimeout(
      uint[3][8] metadata,
      uint[4][8] move,
      uint[176][8] moveOutput,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
      ) public {

        // Get contract instance
        //NujaBattle NujaBattle(serverAddress) = NujaBattle(serverAddress);

        // Verify caller is on the server
        require(NujaBattle(serverAddress).isAddressInServer(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), msg.sender));

        // Verify there is no pending timeout
        require(currentTimeoutTimestamp[metadata[0][0]] == 0);

        if(nbSignature == 0) {
            // First turn to time out
            require(currentTimeoutTurn[metadata[0][0]] == 0 && currentTimeoutPlayer[metadata[0][0]] == 0);
            currentTimeoutTimestamp[metadata[0][0]] = now;
            currentTimeoutClaimer[metadata[0][0]] = msg.sender;
            lastMovesNb[metadata[0][0]] = 0;
        }
        else {
            // Not the first turn
            require(metadata[0][0] == metadata[0][0]-1);

            // Check if it is the first turn
            // During first turn not all alive player are required to be part of the signatures list
            if(metadata[0][1] == 0 && metadata[0][2] == 0) {
                originState = NujaBattle(serverAddress).getInitialState(NujaBattle(serverAddress).getMatchServer(metadata[0][0]));
            }
            else {
                require(nbSignature == NujaBattle(serverAddress).getPlayerNb(NujaBattle(serverAddress).getMatchServer(metadata[0][0])));
            }

            lastMovesNb[metadata[0][0]] = nbSignature;

            // Verify all signatures
            for(uint8 i=0; i<nbSignature; i++) {

                // Check if this turn has been timed out
                if(NujaBattle(serverAddress).isTimedout(metadata[i][0], metadata[i][1], metadata[i][2])) {
                    if(i == 0) {
                        uint[176] memory simulatedTurn = NujaBattle(serverAddress).kill(originState, uint8(metadata[i][2]));
                    }
                    else {
                        simulatedTurn = NujaBattle(serverAddress).kill(moveOutput[i-1], uint8(metadata[i][2]));
                    }
                }
                else {
                    // Verify that the move have been signed by the player
                    require(NujaBattle(serverAddress).moveOwner(metadata[i], move[i], moveOutput[i], signatureRS[i][0], signatureRS[i][1], v[i]) == NujaBattle(serverAddress).getPlayerAddress(metadata[0][0], metadata[i][2]));

                    // Simulate the turn and verify the simulated output is the given output
                    if(i == 0) {
                        simulatedTurn = NujaBattle(serverAddress).simulate(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), originState);
                    }
                    else {
                        simulatedTurn = NujaBattle(serverAddress).simulate(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), moveOutput[i-1]);
                    }
                }

                // Check integrity
                require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

                // If not the last turn check the next turn is correctly the next player
                uint[3] memory newMetadata = NujaBattle(serverAddress).nextTurn(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), metadata[i], moveOutput[i]);
                require(newMetadata[0] == metadata[i+1][0]);
                require(newMetadata[1] == metadata[i+1][1]);
                require(newMetadata[2] == metadata[i+1][2]);

                // Set lastMove to be sure state is shared
                lastMoves[metadata[0][0]][i][0] = uint8(move[i][0]);
                lastMoves[metadata[0][0]][i][1] = uint8(move[i][1]);
                lastMoves[metadata[0][0]][i][2] = uint8(move[i][2]);
                lastMoves[metadata[0][0]][i][3] = uint8(move[i][3]);
                lastMovesTurn[metadata[0][0]][i] = metadata[i][1];
                lastMovesPlayer[metadata[0][0]][i] = uint8(metadata[i][2]);
                lastR[metadata[0][0]][i] = signatureRS[i][0];
                lastS[metadata[0][0]][i] = signatureRS[i][1];
                lastV[metadata[0][0]][i] = v[i];
            }

            // Verify the caller is not the blamed player
            // This technique could be used by the called to kick himself
            // from the server and get back his cheat warrant
            require(NujaBattle(serverAddress).getPlayerAddress(metadata[0][0], newMetadata[2]) != msg.sender);

            // Set timeout attribute
            // Last metadata is last player
            require(newMetadata[1] > currentTimeoutTurn[metadata[0][0]] || (newMetadata[1] == currentTimeoutTurn[metadata[0][0]] && newMetadata[2] >= currentTimeoutPlayer[metadata[0][0]]));
            currentTimeoutPlayer[metadata[0][0]] = uint8(newMetadata[2]);
            currentTimeoutTurn[metadata[0][0]] = newMetadata[1];
            currentTimeoutTimestamp[metadata[0][0]] = now;
            currentTimeoutClaimer[metadata[0][0]] = msg.sender;
        }
    }

    // Called by playing player to stop the timeout against him
    // He has to show he had played the turn
    // The last turn will be incremented
    // Only his signature is suficient (startTimeout imply last signature have been verified)
    function stopTimeout(
      uint[3][8] metadata,
      uint[4][8] move,
      uint[176][8] moveOutput,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
      ) public {

        // Get contract instance
        //NujaBattle NujaBattle(serverAddress) = NujaBattle(serverAddress);

        // Verify there is pending timeout and sender is the blamed player
        require(currentTimeoutTimestamp[metadata[0][0]] > 0);
        require(msg.sender == currentTimeoutPlayer[metadata[0][0]]);
        require(nbSignature > 0);
        require(metadata[0][0] == metadata[0][0]);


        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            originState = NujaBattle(serverAddress).getInitialState(NujaBattle(serverAddress).getMatchServer(metadata[0][0]));
        }
        else {
            require(nbSignature == NujaBattle(serverAddress).getPlayerNb(NujaBattle(serverAddress).getMatchServer(metadata[0][0])));
        }

        lastMovesNb[metadata[0][0]] = nbSignature;

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Check if this turn has been timed out
            if(NujaBattle(serverAddress).isTimedout(metadata[i][0], metadata[i][1], metadata[i][2])) {
                if(i == 0) {
                    uint[176] memory simulatedTurn = NujaBattle(serverAddress).kill(originState, uint8(metadata[i][2]));
                }
                else {
                    simulatedTurn = NujaBattle(serverAddress).kill(moveOutput[i-1], uint8(metadata[i][2]));
                }
            }
            else {
                // Verify that the move have been signed by the player
                require(NujaBattle(serverAddress).moveOwner(metadata[i], move[i], moveOutput[i], signatureRS[i][0], signatureRS[i][1], v[i]) == NujaBattle(serverAddress).getPlayerAddress(metadata[0][0], metadata[i][2]));

                // Simulate the turn and verify the simulated output is the given output
                if(i == 0) {
                    simulatedTurn = NujaBattle(serverAddress).simulate(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), originState);
                }
                else {
                    simulatedTurn = NujaBattle(serverAddress).simulate(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), moveOutput[i-1]);
                }
            }

            // Check integrity
            require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

            // If not the last turn check the next turn is correctly the next player
            uint[3] memory newMetadata = NujaBattle(serverAddress).nextTurn(NujaBattle(serverAddress).getMatchServer(metadata[0][0]), metadata[i], moveOutput[i]);
            require(newMetadata[0] == metadata[i+1][0]);
            require(newMetadata[1] == metadata[i+1][1]);
            require(newMetadata[2] == metadata[i+1][2]);

            // Set lastMove to be sure state is shared
            lastMoves[metadata[0][0]][i][0] = uint8(move[i][0]);
            lastMoves[metadata[0][0]][i][1] = uint8(move[i][1]);
            lastMoves[metadata[0][0]][i][2] = uint8(move[i][2]);
            lastMoves[metadata[0][0]][i][3] = uint8(move[i][3]);
            lastMovesTurn[metadata[0][0]][i] = metadata[i][1];
            lastMovesPlayer[metadata[0][0]][i] = uint8(metadata[i][2]);
            lastR[metadata[0][0]][i] = signatureRS[i][0];
            lastS[metadata[0][0]][i] = signatureRS[i][1];
            lastV[metadata[0][0]][i] = v[i];
        }

        // Set new value to timeout to avoid time out stressing
        require(newMetadata[1] > currentTimeoutTurn[metadata[0][0]] || (newMetadata[1] == currentTimeoutTurn[metadata[0][0]] && newMetadata[2] >= currentTimeoutPlayer[metadata[0][0]]));
        currentTimeoutPlayer[metadata[0][0]] = uint8(newMetadata[2]);
        currentTimeoutTurn[metadata[0][0]] = newMetadata[1];
        currentTimeoutTimestamp[metadata[0][0]] = 0;
    }


    // Called by anybody to confirm a timeout process
    // The player hasn't played his turn in time, he's kicked
    function confirmTimeout(uint matchId) public {
        // Verify caller is on the server
        require(NujaBattle(serverAddress).isAddressInServer(NujaBattle(serverAddress).getMatchServer(matchId), msg.sender));

        // Verify timeout process is pending
        require(currentTimeoutTimestamp[matchId] > 0);
        require(now > currentTimeoutTimestamp[matchId] + timeoutThreshold);

        // Call the necessary function in NujaBattle contract to manage fund, etc.
        NujaBattle(serverAddress).timeoutPlayer(matchId, currentTimeoutClaimer[matchId], currentTimeoutTurn[matchId], currentTimeoutPlayer[matchId]);

        /// Reset timeout
        currentTimeoutTimestamp[matchId] = 0;

        // Update timeout maps
        timeoutTurn[matchId][nbTimeout[matchId]] = currentTimeoutTurn[matchId];
        timeoutPlayer[matchId][nbTimeout[matchId]] = currentTimeoutPlayer[matchId];
        nbTimeout[matchId] += 1;
    }
}
