pragma solidity ^0.4.2;

import "./NujaBattle.sol";
import "./TimeoutStarter.sol";

contract TimeoutStopper {

    address owner;
    address nujaBattle;
    address serverManager;
    address timeoutStarter;
    bool addressesSet;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function TimeoutStopper() public {
        owner = msg.sender;
        nujaBattle = address(0);
        serverManager = address(0);
        timeoutStarter = address(0);
        addressesSet = false;
    }

    function setAddresses(address nujaBattle_, address timeoutStarter_) public onlyOwner {
        require(!addressesSet);

        nujaBattle = nujaBattle_;
        timeoutStarter = timeoutStarter_;
        addressesSet = true;
    }

    // We have recreated this function specifically for this contract beacause metadata and move are merged together
    function moveOwner(
      uint[7] metadataAndMove,
      uint[176] moveOutput,
      bytes32 r,
      bytes32 s,
      uint8 v
      ) public pure returns (address recovered) {

        uint[3] memory metadata;
        uint[4] memory move;

        // Separate metadata and move
        for(uint8 i=0; i<3; i++) {
            metadata[i] = metadataAndMove[i];
        }
        for(; i<7; i++) {
            move[i-3] = metadataAndMove[i];
        }

        // Calculate the hash of the move
        bytes32 hashedMove = keccak256(metadata, move, moveOutput);

        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 msg = keccak256(prefix, hashedMove);

        return ecrecover(msg, v, r, s);
    }

    function nextTurn(
      uint indexServer,
      uint[7] metadataAndMove,
      uint[176] moveOutput
      ) public view returns (uint[3] metadataRet) {

        uint[3] memory metadataTmp;
        metadataTmp[0] = metadataAndMove[0];
        metadataTmp[1] = metadataAndMove[1];
        metadataTmp[2] = metadataAndMove[2];

        uint8 playerMax = ServerManager(serverManager).getPlayerMax(indexServer);

        // We skip dead player
        do {
            metadataTmp[2]++;
            if(uint(metadataTmp[2]) >= playerMax) {
                metadataTmp[2] = 0;
                metadataTmp[1]++;
            }
        } while (NujaBattle(nujaBattle).getHealth(moveOutput, metadataTmp[2]) == 0);

        return metadataTmp;
    }


    // Called by playing player to stop the timeout against him
    // He has to show he had played the turn
    // The last turn will be incremented
    // Only his signature is suficient (startTimeout imply last signature have been verified)
    function stopTimeout(
      uint[7][8] metadataAndMove,
      uint[176][9] moveOutput,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      /* uint[176] originState, */
      uint8 nbSignature
      ) public {

        // Get contract instance
        //NujaBattle NujaBattle(nujaBattle) = NujaBattle(nujaBattle);

        // Verify there is pending timeout and sender is the blamed player
        require(TimeoutStarter(timeoutStarter).isTimeout(metadataAndMove[0][0]));
        require(ServerManager(serverManager).getIndexFromAddress(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]), msg.sender) == TimeoutStarter(timeoutStarter).getCurrentTimeoutPlayer(metadataAndMove[0][0]));
        require(nbSignature > 0);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadataAndMove[0][1] == 0 && metadataAndMove[0][2] == 0) {
            moveOutput[8] = ServerManager(serverManager).getInitialState(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]));
        }

        TimeoutStarter(timeoutStarter).updateLastMoveNb(metadataAndMove[0][0], nbSignature);

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Check if this turn has been timed out
            if(NujaBattle(nujaBattle).isTimedout(metadataAndMove[i][0], metadataAndMove[i][1], metadataAndMove[i][2])) {
                if(i == 0) {
                    uint[176] memory simulatedTurn = NujaBattle(nujaBattle).kill(moveOutput[8], uint8(metadataAndMove[i][2]));
                }
                else {
                    simulatedTurn = NujaBattle(nujaBattle).kill(moveOutput[i-1], uint8(metadataAndMove[i][2]));
                }
            }
            else {
                // Verify that the move have been signed by the player
                require(moveOwner(metadataAndMove[i], moveOutput[i], signatureRS[i][0], signatureRS[i][1], v[i]) == ServerManager(serverManager).getAddressFromIndex(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]), uint8(metadataAndMove[i][2])));

                // Simulate the turn and verify the simulated output is the given output
                if(i == 0) {
                    simulatedTurn = NujaBattle(nujaBattle).simulate(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]), uint8(metadataAndMove[i][2]), uint8(metadataAndMove[i][3]), uint8(metadataAndMove[i][4]), uint8(metadataAndMove[i][5]), uint8(metadataAndMove[i][6]), moveOutput[8]);
                }
                else {
                    simulatedTurn = NujaBattle(nujaBattle).simulate(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]), uint8(metadataAndMove[i][2]), uint8(metadataAndMove[i][3]), uint8(metadataAndMove[i][4]), uint8(metadataAndMove[i][5]), uint8(metadataAndMove[i][6]), moveOutput[i-1]);
                }
            }

            // Check integrity
            require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

            // If not the last turn check the next turn is correctly the next player
            uint[3] memory newMetadata = nextTurn(ServerManager(serverManager).getMatchServer(metadataAndMove[0][0]), metadataAndMove[i], moveOutput[i]);
            if(i < nbSignature-1) {
                require(newMetadata[0] == metadataAndMove[i+1][0]);
                require(newMetadata[1] == metadataAndMove[i+1][1]);
                require(newMetadata[2] == metadataAndMove[i+1][2]);
            }
            else if(metadataAndMove[0][1] > 0 || metadataAndMove[0][2] > 0) {
                // Last turn: we verified every alive player signed their turn
                // Not necessary if the signature list begin from origin
                require(newMetadata[1] > metadataAndMove[0][1] && newMetadata[2] >= metadataAndMove[0][2]);
            }

            // Set lastMove to be sure state is shared
            TimeoutStarter(timeoutStarter).addLastMove(
              metadataAndMove[0][0],
              i,
              uint8(metadataAndMove[i][3]),
              uint8(metadataAndMove[i][4]),
              uint8(metadataAndMove[i][5]),
              uint8(metadataAndMove[i][6])
            );
            TimeoutStarter(timeoutStarter).addLastMoveSignature(
              metadataAndMove[0][0],
              i,
              signatureRS[i][0],
              signatureRS[i][1],
              v[i]
            );
            TimeoutStarter(timeoutStarter).addLastMoveMetadata(
              metadataAndMove[0][0],
              i,
              metadataAndMove[i][1],
              uint8(metadataAndMove[i][2])
            );
        }

        // Set new value to timeout to avoid time out stressing
        require(newMetadata[1] > TimeoutStarter(timeoutStarter).getCurrentTimeoutTurn(metadataAndMove[0][0]) || (newMetadata[1] == TimeoutStarter(timeoutStarter).getCurrentTimeoutTurn(metadataAndMove[0][0]) && newMetadata[2] >= TimeoutStarter(timeoutStarter).getCurrentTimeoutPlayer(metadataAndMove[0][0])));
        TimeoutStarter(timeoutStarter).setCurrentTimeoutInfo(metadataAndMove[0][0], newMetadata[1], uint8(newMetadata[2]));
        TimeoutStarter(timeoutStarter).resetTimeoutTimestamp(metadataAndMove[0][0]);
    }


    // Called by anybody to confirm a timeout process
    // The player hasn't played his turn in time, he's kicked
    function confirmTimeout(uint matchId) public {
        // Verify caller is on the server
        require(ServerManager(serverManager).isAddressInServer(ServerManager(serverManager).getMatchServer(matchId), msg.sender));

        // Verify timeout process is pending
        require(TimeoutStarter(timeoutStarter).isTimeout(matchId));
        require(now > TimeoutStarter(timeoutStarter).getCurrentTimeoutTimestamp(matchId) + TimeoutStarter(timeoutStarter).getTimeoutThreshold());

        // Call the necessary function in NujaBattle contract to manage fund, etc.
        NujaBattle(nujaBattle).timeoutPlayer(matchId, TimeoutStarter(timeoutStarter).getCurrentTimeoutClaimer(matchId), TimeoutStarter(timeoutStarter).getCurrentTimeoutTurn(matchId), TimeoutStarter(timeoutStarter).getCurrentTimeoutPlayer(matchId));

        /// Reset timeout
        TimeoutStarter(timeoutStarter).resetTimeoutTimestamp(matchId);

        // Update timeout maps
        TimeoutStarter(timeoutStarter).confirmTimeout(matchId);
    }

}
