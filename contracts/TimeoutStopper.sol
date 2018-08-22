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
        serverManager = 0x4D336660b3c7267e3aFDd4275ccfFF5B30D697E5;
        nujaBattle = address(0);
        timeoutStarter = address(0);
        addressesSet = false;
    }

    function setAddresses(address nujaBattle_, address timeoutStarter_) public onlyOwner {
        require(!addressesSet);

        nujaBattle = nujaBattle_;
        timeoutStarter = timeoutStarter_;
        addressesSet = true;
    }

    // Called by playing player to stop the timeout against him
    // He has to show he had played the turn
    // The last turn will be incremented
    // Only his signature is suficient (startTimeout imply last signature have been verified)
    function stopTimeout(
      uint[3][8] metadata,
      uint[4][8] move,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      uint8[176] moveInput,
      uint8 nbSignature
      ) public {

        // Verify there is pending timeout and sender is the blamed player
        require(TimeoutStarter(timeoutStarter).isTimeout(metadata[0][0]));
        require(ServerManager(serverManager).getIndexFromAddress(ServerManager(serverManager).getMatchServer(metadata[0][0]), msg.sender) == TimeoutStarter(timeoutStarter).getCurrentTimeoutPlayer(metadata[0][0]));
        require(nbSignature > 0);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            moveInput = ServerManager(serverManager).getInitialState(ServerManager(serverManager).getMatchServer(metadata[0][0]));
        }

        TimeoutStarter(timeoutStarter).updateLastMoveNb(metadata[0][0], nbSignature);

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Check if this turn has been timed out
            if(NujaBattle(nujaBattle).isTimedout(metadata[i][0], metadata[i][1], metadata[i][2])) {
                if(i == 0) {
                    uint8[176] memory simulatedTurn = NujaBattle(nujaBattle).kill(moveInput, uint8(metadata[i][2]));
                }
                else {
                    simulatedTurn = NujaBattle(nujaBattle).kill(simulatedTurn, uint8(metadata[i][2]));
                }
            }
            else {
                // Simulate the turn and verify the simulated output is the given output
                if(i == 0) {
                    simulatedTurn = NujaBattle(nujaBattle).simulate(ServerManager(serverManager).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), moveInput);
                }
                else {
                    simulatedTurn = NujaBattle(nujaBattle).simulate(ServerManager(serverManager).getMatchServer(metadata[0][0]), uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), simulatedTurn);
                }

                // Verify that the move have been signed by the player
                require(NujaBattle(nujaBattle).moveOwner(metadata[i], move[i], simulatedTurn, signatureRS[i][0], signatureRS[i][1], v[i]) == ServerManager(serverManager).getAddressFromIndex(ServerManager(serverManager).getMatchServer(metadata[0][0]), uint8(metadata[i][2])));
            }

            // If not the last turn check the next turn is correctly the next player
            uint[3] memory newMetadata = NujaBattle(nujaBattle).nextTurn(ServerManager(serverManager).getMatchServer(metadata[0][0]), metadata[i], simulatedTurn);
            if(i < nbSignature-1) {
                require(newMetadata[0] == metadata[i+1][0]);
                require(newMetadata[1] == metadata[i+1][1]);
                require(newMetadata[2] == metadata[i+1][2]);
            }
            else if(metadata[0][1] > 0 || metadata[0][2] > 0) {
                // Last turn: we verified every alive player signed their turn
                // Not necessary if the signature list begin from origin
                require((newMetadata[1] == (metadata[0][1] + 1) && newMetadata[2] >= metadata[0][2]) || (newMetadata[1] > (metadata[0][1] + 1)));
            }

            // Set lastMove to be sure state is shared
            TimeoutStarter(timeoutStarter).addLastMove(
              metadata[0][0],
              i,
              uint8(move[i][0]),
              uint8(move[i][1]),
              uint8(move[i][2]),
              uint8(move[i][3])
            );
            TimeoutStarter(timeoutStarter).addLastMoveSignature(
              metadata[0][0],
              i,
              signatureRS[i][0],
              signatureRS[i][1],
              v[i]
            );
            TimeoutStarter(timeoutStarter).addLastMoveMetadata(
              metadata[0][0],
              i,
              metadata[i][1],
              uint8(metadata[i][2])
            );
        }

        // Set new value to timeout to avoid time out stressing
        require(newMetadata[1] > TimeoutStarter(timeoutStarter).getCurrentTimeoutTurn(metadata[0][0]) || (newMetadata[1] == TimeoutStarter(timeoutStarter).getCurrentTimeoutTurn(metadata[0][0]) && newMetadata[2] >= TimeoutStarter(timeoutStarter).getCurrentTimeoutPlayer(metadata[0][0])));
        TimeoutStarter(timeoutStarter).setCurrentTimeoutInfo(metadata[0][0], newMetadata[1], uint8(newMetadata[2]));
        TimeoutStarter(timeoutStarter).resetTimeoutTimestamp(metadata[0][0]);
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
