pragma solidity ^0.4.2;

import "./CharacterRegistry.sol";
import "./NujaRegistry.sol";
import "./Nuja/Nuja.sol";
import "./WeaponRegistry.sol";
import "./Weapon/Weapon.sol";
import "./Geometry.sol";
import "./StateManager.sol";


contract NujaBattle is Geometry, StateManager {

    // General values
    address owner;
    address characterRegistry;
    address weaponRegistry;

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Structures

    struct Player {
        uint characterIndex;
        uint8 initialX;
        uint8 initialY;
    }

    struct Server {
        uint id;
        uint currentMatchId; // Warning: offset
        string name;
        address owner;
        uint8 playerMax;
        uint8 playerNb;
        uint8 state;       // 0: offline, 1: waiting, 2: running
        mapping (uint8 => mapping (uint8 => uint)) buildings;
        mapping (uint8 => mapping (uint8 => uint)) playersPosition;
        mapping (uint8 => Player) players;
        mapping (address => uint8) playerIndex;   // Warning: offset
        /* uint timeoutStart;
        uint8 timeoutPlayer;          // Warning: offset
        uint timeoutBlameStart;
        uint8 blamePlayer;            // Warning: offset
        uint lastConfirmedTurn;
        uint lastConfirmedTurnPlayer; */
        /* uint8[8][4] lastMoves;        // Used to avoid not shared timeout attack */
    }

    // Get the server associated with the match id
    // The value is server.id + 1 because 0 represents not started yet match or ended match
    mapping (uint => uint) serverMatch;
    uint matchNb;

    uint serverNumber;
    Server[] servers;

    // Necessary to get user's server
    mapping (address => uint) serverUserNumber;
    mapping (address => mapping (uint => uint)) serverUserIndex;

    // Map character to server
    mapping (uint => uint) characterServer;  // Offset

    ///////////////////////////////////////////////////////////////

    function NujaBattle() public {
        owner = msg.sender;
        serverNumber = 0;
        characterRegistry = address(0);
        weaponRegistry = address(0);
        matchNb= 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Administration functions

    function changeCharacterRegistry(address registry) public onlyOwner {
        characterRegistry = registry;
    }

    function changeWeaponRegistry(address registry) public onlyOwner {
        weaponRegistry = registry;
    }

    function addServer(string name, uint8 max) public {
        require(max > 1 && max <= 8);
        Server memory newServer;
        newServer.id = serverNumber;
        newServer.currentMatchId = 0;
        newServer.name = name;
        newServer.owner = msg.sender;
        newServer.state = 0;
        newServer.playerMax = max;
        newServer.playerNb = 0;
        /* newServer.timeoutStart = 0;
        newServer.lastConfirmedTurn = 0;
        newServer.lastConfirmedTurnPlayer = 0; */
        servers.push(newServer);

        // Update general information
        serverUserIndex[msg.sender][serverUserNumber[msg.sender]] = serverNumber;
        serverUserNumber[msg.sender] += 1;
        serverNumber += 1;
    }

    // Set the server online, player can then join it
    function setServerOnline(uint indexServer) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);

        servers[indexServer].state = 1;
    }

    // Set the server offline
    function setServerOffline(uint indexServer) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 1);
        require(servers[indexServer].owner == msg.sender);

        // If player has already joined the server, it can't be offline
        require(servers[indexServer].playerNb == 0);

        servers[indexServer].state = 0;
    }

    function addBuildingToServer(uint indexServer, uint8 x, uint8 y, uint weapon) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);
        require(x < 10 && y < 10);
        require(servers[indexServer].buildings[x][y] == 0);

        // Verify weapon exists
        WeaponRegistry reg = WeaponRegistry(weaponRegistry);
        require(weapon < reg.getWeaponNumber());

        servers[indexServer].buildings[x][y] = 2 + weapon;
    }

    function removeBuildingFromServer(uint indexServer, uint8 x, uint8 y) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);
        require(x < 10 && y < 10);
        require(servers[indexServer].buildings[x][y] > 0);

        servers[indexServer].buildings[x][y] = 0;
    }

    function addPlayerToServer(uint character, uint server) public {
        require(server < serverNumber);
        require(servers[server].state == 1);
        require(characterServer[character] == 0);

        // Verify character exists and subcribes it
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        require(character < reg.totalSupply());
        require(msg.sender == reg.ownerOf(character));
        characterServer[character] = server+1;

        // Create player
        uint8 numero = servers[server].playerNb;
        Player memory newPlayer;
        newPlayer.characterIndex = character;
        newPlayer.initialX = numero;
        newPlayer.initialY = numero;

        // Player information for server
        servers[server].players[numero] = newPlayer;
        servers[server].playersPosition[numero][numero] = numero+1;
        servers[server].playerIndex[msg.sender] = numero+1;

        servers[server].playerNb += 1;
        if(servers[server].playerNb >= servers[server].playerMax) {
            // If it was the last player, we start the game
            servers[server].state = 2;
        }
    }


    ///////////////////////////////////////////////////////////////
    /// Server functions

    // Servers informations

    function getServerNb() public view returns(uint nbRet) {
        return serverNumber;
    }

    function getServerName(uint indexServer) public view returns(string nameRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].name;
    }

    function getMatchServer(uint idMatch) public view returns(uint serverRet) {
        require(idMatch < matchNb);

        uint serverId = serverMatch[idMatch];
        require(serverId>0);

        return serverId-1;
    }

    function getServerCurrentMatch(uint indexServer) public view returns(uint matchRet) {
        require(indexServer < serverNumber);

        uint matchId = servers[indexServer].currentMatchId;
        require(matchId>0);

        return matchId-1;
    }

    function getPlayerMax(uint indexServer) public view returns(uint8 playerMaxRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].playerMax;
    }

    function getServerState(uint indexServer) public view returns(uint8 stateRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].state;
    }

    function getServerInfo(uint indexServer) public view returns(string nameRet, uint id, uint8 playerMaxRet) {
        require(indexServer < serverNumber);
        return (servers[indexServer].name, servers[indexServer].id, servers[indexServer].playerMax);
    }

    function getServerUserNumber(address user) public view returns(uint serverUserNumberRet) {
        return serverUserNumber[user];
    }

    function getServerUserIndex(address user, uint index) public view returns(uint serverUserIndexRet) {
        require(index < serverUserNumber[user]);

        return serverUserIndex[user][index];
    }


    // Specific server information

    function getInitialState(uint indexServer) public view returns(uint[176] ret) {
        require(indexServer < serverNumber);

        uint[176] memory state;

        // Buildings
        for(uint8 i = 0; i<8; i++) {
            for(uint8 j = 0; j<8; j++) {
                state[i*8+j] = servers[indexServer].buildings[i][j];
            }
        }
        // Players
        for(i = 0; i<8; i++) {
            for(j = 0; j<8; j++) {
                state[64+i*8+j] = servers[indexServer].playersPosition[i][j];
            }
        }
        // healths
        for(i = 0; i<servers[indexServer].playerMax; i++) {
            state[128+i] = 100;
        }
        for(i = servers[indexServer].playerMax; i<8; i++) {
            state[128+i] = 0;
        }
        // Positions
        for(i = 0; i<servers[indexServer].playerMax; i++) {
            state[136+i] = servers[indexServer].players[i].initialX;
            state[144+i] = servers[indexServer].players[i].initialY;
        }
        for(i = servers[indexServer].playerMax; i<8; i++) {
            state[136+i] = 0;
            state[144+i] = 0;
        }
        // Weapons
        for(i = 0; i<24; i++) {
            state[152+i] = 0;
        }

        return state;
    }

    function getIndexFromAddress(uint indexServer, address ownerAddress) public view returns(uint8 indexRet) {
        require(indexServer < serverNumber);
        require(servers[indexServer].playerIndex[ownerAddress] > 0);

        return servers[indexServer].playerIndex[ownerAddress]-1;
    }

    function isAddressInServer(uint indexServer, address ownerAddress) public view returns(bool isRet) {
        require(indexServer < serverNumber);

        return (servers[indexServer].playerIndex[ownerAddress] > 0);
    }

    function playerCharacter(uint indexServer, uint8 indexPlayer) public view returns(uint characterIndex) {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerMax);

        return (servers[indexServer].players[indexPlayer].characterIndex);
    }

    function getCharacterServer(uint characterId) public view returns(uint serverId) {
        // Verify character exists
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        require(characterId < reg.totalSupply());

        return characterServer[characterId];
    }

    /* function getLastMoves(uint indexServer) public view returns(uint8[8][4] ret) {
        return servers[indexServer].lastMoves;
    } */

    //////////////////////////////////////////////////////////////////
    // Turn simulation

    // idMove:
    // 0: Simple move
    // 1: Simple attack
    // 2: Explore building
    // 3: Weapon
    // 4: Nuja power
    // 5: Idle
    function simulate(uint indexServer, uint8 idMove, uint8 xMove, uint8 yMove, uint8 indexWeapon, uint[176] moveInput) public view returns (uint[176] moveOutput) {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 2);
        require(idMove < 6);
        require(xMove < 8 && yMove < 8);

        // Get the index of the sender
        uint8 p = servers[indexServer].playerIndex[msg.sender];
        require(p > 0);
        p -= 1;

        if (idMove == 0) {
            return move(p, xMove, yMove, moveInput);
        }
        else if (idMove == 1) {
            return attack(p, xMove, yMove, moveInput);
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
    }

    function move(uint p, uint8 x, uint8 y, uint[176] moveInput) internal pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        require(distance(x, y, xInitial, yInitial) == 1);

        return movePlayer(moveInput, p, x, y);
    }

    function attack(uint8 p, uint8 x, uint8 y, uint[176] moveInput) internal pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        require(distance(x, y, xInitial, yInitial) == 1);

        uint opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);
        opponent -= 1;

        return damage(moveInput, opponent, 20);
    }

    function exploreBuilding(uint8 p, uint[176] moveInput) internal pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        uint buildingCode = getBuilding(moveInput, xInitial, yInitial);

        // Add the weapon
        require(buildingCode > 1);
        uint[176] memory tmp = addWeapon(moveInput, p, buildingCode-2);

        // Set building as explored
        return setBuilding(tmp, xInitial, yInitial, 1);
    }

    function useWeapon(uint8 p, uint8 x, uint8 y, uint8 index, uint[176] moveInput) internal view returns (uint[176] moveOutput) {
        uint weaponId = getWeapon(moveInput, p, index);

        // Get weapon contract
        WeaponRegistry weaponReg = WeaponRegistry(weaponRegistry);
        address weaponAddress = weaponReg.getContract(weaponId);

        // Call the weapon function
        Weapon w = Weapon(weaponAddress);
        return w.use(x, y, p, moveInput);
    }

    function usePower(uint indexServer, uint8 p, uint8 x, uint8 y, uint[176] moveInput) internal view returns (uint[176] moveOutput) {
        CharacterRegistry characterContract = CharacterRegistry(characterRegistry);
        uint characterIndex = servers[indexServer].players[p].characterIndex;
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
    // Side effects functions

    /* function moveOwner(
      uint[3] metadata,
      uint8[4] move,
      uint[176] moveOutput,
      uint r,
      uint s,
      uint8 v
      ) internal pure returns (address recovered) {

        // Calculate the hash of the move
        bytes32 hashedMove = keccak256(metadata, move, moveOutput);

        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 msg = keccak256(prefix, hashedMove);

        return ecrecover(msg, v, (bytes32)r, (bytes32)s);
    } */

    /* function nextTurn(
      uint[3] metadata,
      uint[176] moveOutput,
      uint8 playerNb
      ) internal pure returns (uint[3] metadataRet) {
        do {
            metadata[2]++;
            if(metadata[2] >= playerNb) {
                metadata[2] = 0;
                metadata[1]++;
            }
        } while (state[128+metadata[2]]);

        return(metadata);
    } */


    /* function verifyState(
      uint[8][3] metadata,
      uint8[8][4] move,
      uint[8][176] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint8 nbSignature,
      address caller
      ) internal {

        // Get server
        uint matchId = metadata[0][0];
        uint serverId = serverMatch[matchId]
        require(serverId > 0);
        serverId -= 1;

        // Verify caller is in the server
        require(isAddressInServer(serverId, caller));

        uint lastTurn =  metadata[0][1];
        uint lastPlayer =  metadata[0][2];

        // Check if number of signature is less than player number (this means we are in the first match turn)
        require(nbSignature > 1 && nbSignature < servers[serverId].playerMax)
        if(nbSignature < servers[serverId].playerMax) {
            require(metadata[0][1] == 0 && metadata[0][2] == 0);
        }

        // We check if all signatures are correctly signed
        for(uint8 i = 0; i<nbSignature; i++) {
            // Verify metadata
            require(metadata[i][0] == matchId);

            // Verify match turn
            if(lastPlayer+i >= nbSignature) {
                require(metadata[i][1] == lastTurn+1);
            }
            else {
                require(metadata[i][1] == lastTurn);
            }

            // Verify player turn
            require(metadata[i][2] == (lastPlayer+i)%(nbSignature));

            // Check the move signer
            require(getIndexFromAddress(serverId, moveOwner(metadata[i], move[i], moveOutput[i], r[i], s[i], v[i])) == metadata[i][2]);

            // Skip dead player
            uint8 j = i;
            for(i = i+1; i<nbSignature; i++) {
                if(getHealth(moveOutput[j], (lastPlayer+i)%(nbSignature)) > 0) {
                    i = i-1; // i will be incremented by the first loop
                    break;
                }
            }
        }

        // This signature has been approved by all player so we can state them as confirmed
        if(metadata[0][1] > 0 || metadata[0][2] > 0) {
            servers[serverId].lastConfirmedTurn = lastTurn;
            servers[serverId].lastConfirmedTurnPlayer = lastPlayer;
        }
    } */


    //////////////////////////////////////////////////////////////////
    // Dispute functions
    //////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////
    // Timeout functions

    // Called by anybody to start a timeout process against the player
    // TODO: first player case
    // TODO: manage dead player
    /* function startTimeout(
      uint[8][3] metadata,
      uint8[8][4] move,
      uint[8][176] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint8 nbSignature
      ) public {

        // Get server
        uint matchId = metadata[0][0];
        uint serverId = serverMatch[matchId]
        require(serverId > 0);
        serverId -= 1;

        // No pending timeout
        require(servers[serverId].timeoutPlayer == 0);

        // Verify the sended signatures
        verifyState(metadata, move, moveOutput, r, s, v, nbSignature, msg.sender);

        // Get blamed player
        if(nbSignature < servers[serverId].playerMax) {
            servers[serverId].timeoutPlayer = metadata[nbSignature][2] + 1; // +1 because offset
        }
        else {
            servers[serverId].timeoutPlayer = metadata[0][2] + 1;           // +1 because offset
        }

        servers[serverId].timeoutBlameStart = now;

        // In case the called has maliciously not shared his state
        servers[serverId].lastMoves = move;
    } */

    // Called by playing player to stop the timeout against him
    // He has to show he had played the turn
    // The last turn will be incremented
    // Only his signature is suficient (startTimeout imply last signature have been verified)
    /* function stopTimeout(
      uint[3] metadata,
      uint8[4] move,
      uint[176] moveOutput,
      uint r,
      uint s,
      uint8 v,
      ) public {
        // Get server
        uint matchId = metadata[0];
        uint serverId = serverMatch[matchId]
        require(serverId > 0);
        serverId -= 1;

        // Check if the caller is actually blamed
        require(isAddressInServer(serverId, msg.sender));
        uint8 playerId = getIndexFromAddress(serverId, msg.sender);
        require(servers[serverId].timeoutPlayer == playerId+1);

        // Check metadata
        // TODO: manage dead player
        if(servers[serverId].lastConfirmedTurnPlayer == servers[serverId].playerMax-1) {
            require(metadata[1] == servers[serverId].lastConfirmedTurn + 1);
        }
        else {
            require(metadata[1] == servers[serverId].lastConfirmedTurn);
        }
        require(metadata[2] == playerId);

        // Check the signature
        // Check the move signer
        require(getIndexFromAddress(serverId, moveOwner(metadata, move, moveOutput, r, s, v)) == playerId);

        // TODO: Set timeout to 0 and add the move to list
    } */

    // Called by anybody to confirm a timeout process
    // The player hasn't played his turn in time, he's kicked
    /* function confirmTimeout() public {
    } */

    //////////////////////////////////////////////////////////////////
    // Cheat functions

    // Called by anybody to blame a cheater
    // The blamed cheater will have a timeout to prove he hasn't cheated
    /* function blame(
      uint[8][3] metadata,
      uint8[8][4] move,
      uint[8][176] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint8 nbSignature
      ) public {

          // Get server
          uint matchId = metadata[0][0];
          uint serverId = serverMatch[matchId]
          require(serverId > 0);
          serverId -= 1;

          require(servers[serverId].blamePlayer == 0);
    } */

    // Called by blamed cheater to prove he hasn't cheated
    // If the protest succeed, the blamer is kicked
    /* function protest(
      uint[8][3] metadata,
      uint8[8][4] move,
      uint[8][176] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint8 nbSignature
      ) public {

          // Get server
          uint matchId = metadata[0][0];
          uint serverId = serverMatch[matchId]
          require(serverId > 0);
          serverId -= 1;

          require(servers[serverId].blamePlayer > 0);
    } */

    // If the blamed cheater hasn't prove in time, he's kicked
    /* function confirmBlame() public {

    } */


    // Finish turn
    /* function finish(address, input) {

    } */

    /* function quit() {

    } */

    // REMOVE
    // Termination functions
    /* function killPlayer(uint indexServer, uint8 p) internal {
        // Remove player from map
        var (x, y) = playerPosition(indexServer, p);
        servers[indexServer].fields[x][y].character = 0;

        // Set player to dead
        servers[indexServer].players[p].alive = false;

        // Unregister the player from the server
        uint character = servers[indexServer].players[p].characterIndex;
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        reg.unsetCharacterServer(character);
        servers[indexServer].playerIndex[reg.ownerOf(character)] = 0;

        servers[indexServer].playerNb -= 1;

        // If only one player remaining, we terminate the server
        if (servers[indexServer].playerNb == 1) {
            terminateServer(indexServer);
        }
    } */

    // REMOVE
    /* function terminateServer(uint indexServer) internal {
        // Search for the last player
        for(uint8 i = 0; i < servers[indexServer].playerMax; i++) {
            if (servers[indexServer].players[i].alive) {
                killPlayer(indexServer, i);
                break;
            }
        }

        servers[indexServer].running = false;
    } */



    // TODO:
    // Finir fonction dispute
    // Rafistoler code en fonction de la nouvelle architecture (server.state)
    // Faire fonction de fin de partie/kill de joueur
    // Permettre à n'importe qui de rentabiliser son serveur
}
