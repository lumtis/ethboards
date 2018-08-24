/*
  Main contract for matchmaking
*/
pragma solidity ^0.4.2;

import "CharacterRegistry.sol";
import "NujaRegistry.sol";
import "Nuja.sol";
import "WeaponRegistry.sol";
import "Weapon.sol";
import "Geometry.sol";
import "StateManager.sol";
import "ServerManager.sol";

contract NujaBattle is Geometry, StateManager {

    // General values
    address characterRegistry;
    address weaponRegistry;
    address timeoutStopper;
    address serverManager;

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier fromTimeoutStopper {
        require(msg.sender == timeoutStopper);
        _;
    }

    // Give for a given match the turn that have been timed out
    mapping (uint => mapping (uint => mapping (uint => bool))) matchTimeoutTurns;
    mapping (uint => mapping (uint8 => bool)) deadPlayer;


    ///////////////////////////////////////////////////////////////

    function NujaBattle() public {
        characterRegistry = address(0);
        weaponRegistry = address(0);
        serverManager = address(0);
        timeoutStopper = address(0);
    }


    //////////////////////////////////////////////////////////////////
    // Turn simulation

    // idMove:
    // 0: Simple move
    // 1: Simple attack
    // 2: Explore building
    // 3: Weapon
    // 4: Nuja power
    // 5: Idle
    function simulate(uint indexServer, uint8 p, uint8 idMove, uint8 xMove, uint8 yMove, uint8 indexWeapon, uint8[176] moveInput) public view returns (uint8[176] moveOutput) {
        require(idMove < 6);
        require(xMove < 8 && yMove < 8);
        require(p < ServerManager(serverManager).getPlayerMax(indexServer));
        require(isAlive(moveInput, p));

        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);

        if (idMove == 0) {
            // Move
            require(distance(xMove, yMove, xInitial, yInitial) == 1);
            return movePlayer(moveInput, p, xMove, yMove);
        }
        else if (idMove == 1) {
            // Simple attack
            require(distance(xMove, yMove, xInitial, yInitial) == 1);
            uint8 opponent = getPlayer(moveInput, xMove, yMove);
            require(opponent > 0);
            opponent -= 1;
            return damage(moveInput, opponent, 30);
        }
        else if (idMove == 2) {
            return exploreBuilding(p, moveInput);
        }
        else if (idMove == 3) {
            return useWeapon(p, xMove, yMove, indexWeapon, moveInput);
        }
        else if (idMove == 4) {
            return usePower(indexServer, p, xMove, yMove, moveInput);
        }
        else {
            return moveInput;
        }
    }

    function exploreBuilding(uint8 p, uint8[176] moveInput) internal pure returns (uint8[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        uint8 buildingCode = getBuilding(moveInput, xInitial, yInitial);

        // Add the weapon
        require(buildingCode > 1);
        moveOutput = addWeapon(moveInput, p, buildingCode-2);

        // Set building as explored
        return setBuilding(moveOutput, xInitial, yInitial, 1);
    }

    function useWeapon(uint8 p, uint8 x, uint8 y, uint8 index, uint8[176] moveInput) internal view returns (uint8[176] moveOutput) {
        uint8 weaponId = getWeapon(moveInput, p, index);

        // Get weapon contract
        WeaponRegistry weaponReg = WeaponRegistry(weaponRegistry);
        address weaponAddress = weaponReg.getContract(weaponId);

        // Call the weapon function
        Weapon w = Weapon(weaponAddress);
        moveOutput = w.use(x, y, p, moveInput);

        // Remove weapon after use
        return removeWeapon(moveOutput, p, index);
    }

    function usePower(uint indexServer, uint8 p, uint8 x, uint8 y, uint8[176] moveInput) internal view returns (uint8[176] moveOutput) {
        CharacterRegistry characterContract = CharacterRegistry(characterRegistry);
        uint characterIndex = ServerManager(serverManager).playerCharacter(indexServer, p);
        var r_nuja = characterContract.getCharacterNuja(characterIndex);

        // Get nuja contract
        address nujaRegistryAddress = characterContract.getNujaRegistry();
        NujaRegistry nujaContract = NujaRegistry(nujaRegistryAddress);
        address nujaAddress = nujaContract.getContract(r_nuja);

        // Call the power function
        Nuja player_nuja = Nuja(nujaAddress);
        return player_nuja.power(x, y, p, moveInput);
    }


    //////////////////////////////////////////////////////////////////
    // Match functions

    // Get the next turn metadata from old metadata and move's output
    function nextTurn(
      uint indexServer,
      uint[3] metadata,
      uint8[176] moveOutput
      ) public view returns (uint[3] metadataRet) {

        metadataRet[0] = metadata[0];
        metadataRet[1] = metadata[1];
        metadataRet[2] = metadata[2];

        uint8 playerMax = ServerManager(serverManager).getPlayerMax(indexServer);

        // We skip dead player
        do {
            metadataRet[2]++;
            if(metadataRet[2] >= playerMax) {
                metadataRet[2] = 0;
                metadataRet[1]++;
            }
        } while (getHealth(moveOutput, uint8(metadataRet[2])) == 0);

        return metadataRet;
    }

    // Verify if the given next metadata match the actual next metadata
    function verifyNextTurn(uint indexServer, uint[3] metadata, uint[3] metadataNext, uint8[176] moveOutput) internal view {
        uint[3] memory newMetadata = nextTurn(indexServer, metadata, moveOutput);
        require(newMetadata[0] == metadataNext[0]);
        require(newMetadata[1] == metadataNext[1]);
        require(newMetadata[2] == metadataNext[2]);
    }

    // Check depending on first and last metadata that every alive player has signed their turn
    function verifyAllSigned(uint indexServer, uint[3] metadataFirst, uint[3] metadataLast, uint8[176] moveOutput) internal view {
        uint[3] memory newMetadata = nextTurn(indexServer, metadataLast, moveOutput);
        require(newMetadata[0] == metadataFirst[0]);
        require((newMetadata[1] == (metadataFirst[1]+1) && newMetadata[2] >= metadataFirst[2]) || (newMetadata[1] > metadataFirst[1]+1));
    }

    // Check if player is killed
    function isKilled(uint indexServer, uint8 p) public view returns (bool isRet) {
        uint currentMatch = ServerManager(serverManager).getServerCurrentMatch(indexServer);
        return deadPlayer[currentMatch][p];
    }

    // Get array of killed player
    // Useful for iterative function in backend code
    function getKilledArray(uint indexServer) public view returns (bool[8] killedRet) {

        uint currentMatch = ServerManager(serverManager).getServerCurrentMatch(indexServer);

        for(uint8 i=0; i<8; i++) {
            if(deadPlayer[currentMatch][i]) {
                killedRet[i] = true;
            }
            else {
                killedRet[i] = false;
            }
        }

        return killedRet;
    }


    // Tell to the contract that a player has been killed
    // Only if this function is call, the player will be actually removed from server
    function killPlayer(
      uint indexServer,
      uint8[2] killerAndKilled, // First element represents killer and second the killed: we use this trik to avoid stack too deep error
      uint[3][8] metadata,
      uint[4][8] move,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      uint8[176] moveInput,
      uint8 nbSignature
      ) public {
        require(nbSignature > 0);
        require(metadata[0][0] == ServerManager(serverManager).getServerCurrentMatch(indexServer));
        require(metadata[0][2] < ServerManager(serverManager).getPlayerMax(indexServer));
        require(!deadPlayer[metadata[0][0]][killerAndKilled[1]]);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            moveInput = ServerManager(serverManager).getInitialState(indexServer);
        }

        // Verify the killer is the last player
        require(metadata[nbSignature-1][2] == killerAndKilled[0]);

        // Verify the player is originally alive
        require(isAlive(moveInput, killerAndKilled[1]));

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Check if this turn has been timed out
            if(matchTimeoutTurns[metadata[i][0]][metadata[i][1]][metadata[i][2]]) {
                // If the turn has been timed out no need to verify move owner
                if(i == 0) {
                    uint8[176] memory simulatedTurn = kill(moveInput, uint8(metadata[i][2]));
                }
                else {
                    simulatedTurn = kill(simulatedTurn, uint8(metadata[i][2]));
                }
            }
            else {
                // Simulate the turn and verify the simulated output is the given output
                if(i == 0) {
                    simulatedTurn = simulate(indexServer, uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), moveInput);
                }
                else {
                    simulatedTurn = simulate(indexServer, uint8(metadata[i][2]), uint8(move[i][0]), uint8(move[i][1]), uint8(move[i][2]), uint8(move[i][3]), simulatedTurn);
                }

                // Verify that the move have been signed by the player
                require(moveOwner(metadata[i], move[i], simulatedTurn, signatureRS[i][0], signatureRS[i][1], v[i]) == ServerManager(serverManager).getAddressFromIndex(indexServer, uint8(metadata[i][2])));
            }

            // Vertify metadata integrity
            if(i < nbSignature-1) {
                // If not the last turn check the next turn is correctly the next player
                verifyNextTurn(indexServer, metadata[i], metadata[i+1], simulatedTurn);
            }
            else if(metadata[0][1] > 0 || metadata[0][2] > 0) {
                // Last turn: we verified every alive player signed their turn
                // Not necessary if the signature list begin from origin
                verifyAllSigned(indexServer, metadata[0], metadata[i], simulatedTurn);
            }

            // Verify the killed has been actually killed in the last turn
            if(i < nbSignature-1) {
                // If it was not the last turn, the player should still be alive
                require(isAlive(simulatedTurn, killerAndKilled[1]));
            }
            else {
                // Otherwise he must be dead
                require(!(isAlive(simulatedTurn, killerAndKilled[1])));
            }
        }

        // Set player to dead
        deadPlayer[ServerManager(serverManager).getServerCurrentMatch(indexServer)][killerAndKilled[1]] = true;

        // Kill the player
        ServerManager(serverManager).removePlayer(indexServer, killerAndKilled[1]);

        // Transfer fund to players when a player is killed
        // Killer receive money bag from killed
        // Killed get his cheat warrant back
        ServerManager(serverManager).nujaBattleTransfer(ServerManager(serverManager).getAddressFromIndex(indexServer, killerAndKilled[0]), ServerManager(serverManager).getServerMoneyBag(indexServer));
        ServerManager(serverManager).nujaBattleTransfer(ServerManager(serverManager).getAddressFromIndex(indexServer, killerAndKilled[1]), ServerManager(serverManager).getCheatWarrant());

        // If it was the last player, terminate the server
        if(ServerManager(serverManager).getPlayerNb(indexServer) == 1) {
            ServerManager(serverManager).terminateServer(indexServer, killerAndKilled[0]);
        }
    }


    // Function for timeout manager
    function timeoutPlayer(uint matchId, address timeoutClaimer, uint timeoutTurn, uint8 timeoutPlayer) public fromTimeoutStopper {
        uint server = ServerManager(serverManager).getMatchServer(matchId);

        // Transfer fund to players when a player is timed out
        // Timeout claimer receive money bag and cheat warrant from timed out
        ServerManager(serverManager).nujaBattleTransfer(timeoutClaimer, ServerManager(serverManager).getServerMoneyBag(server) + ServerManager(serverManager).getCheatWarrant());

        // Set player to dead
        deadPlayer[matchId][timeoutPlayer] = true;

        // Kick blamed player
        ServerManager(serverManager).removePlayer(server, timeoutPlayer);

        // register timeout
        matchTimeoutTurns[matchId][timeoutTurn][timeoutPlayer] = true;

        // If it was the last player, terminate the server
        if(ServerManager(serverManager).getPlayerNb(server) == 1) {

            // Search for last alive player
            for(uint8 i=0; i<ServerManager(serverManager).getPlayerMax(server); i++) {
                if(deadPlayer[matchId][i] == false) {
                  // Terminate the server
                  ServerManager(serverManager).terminateServer(server, i);
                  break;
                }
            }
        }
    }

    function isTimedout(uint matchId, uint turn, uint turnPlayer) public view returns (bool timedoutRet) {
        return matchTimeoutTurns[matchId][turn][turnPlayer];
    }
}
