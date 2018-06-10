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
    uint serverCreationFee;
    uint cheatWarrant;
    uint blameThreshold;
    uint timeoutThreshold;

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Structures

    struct Player {
        address owner;
        uint characterIndex;
        uint8 initialX;
        uint8 initialY;
    }

    struct Server {
        uint id;
        string name;
        address owner;
        uint fee;
        uint moneyBag;
        uint currentMatchId; // Warning: offset
        uint8 playerMax;
        uint8 playerNb;
        uint8 state;       // 0: offline, 1: waiting, 2: running
        mapping (uint8 => mapping (uint8 => uint)) buildings;
        mapping (uint8 => mapping (uint8 => uint)) playersPosition;   // TODO: Clear player position at match end
        mapping (uint8 => Player) players;
        mapping (address => uint8) playerIndex;   // Warning: offset

        uint8 currentTimeoutPlayer;
        uint currentTimeoutTurn;
        uint currentTimeoutTimestamp;
        address currentTimeoutClaimer;

        // Used to avoid not shared timeout attack
        mapping (uint8 => mapping (uint8 => uint8)) lastMoves;

        /* uint8 blamed;            // Warning: offset
        uint8 blamer;
        uint blameTimestamp
        uint blameTurn; */
    }

    uint serverNumber;
    Server[] servers;

    // Get the server associated with the match id
    // The value is server.id + 1 because 0 represents not started yet match or ended match
    mapping (uint => uint) serverMatch;
    uint matchNb;

    // Give for a given match the turn that have been timed out
    mapping (uint => mapping (uint => mapping (uint => bool))) matchTimeoutTurns;
    mapping (uint => mapping (uint8 => bool)) deadPlayer;

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
        serverCreationFee = 5 finney;
        cheatWarrant = 5 finney;
        matchNb= 0;

        // 300 sec = 5 min
        blameThreshold = 300;
        timeoutThreshold = 300;
    }

    ///////////////////////////////////////////////////////////////
    /// Administration functions

    function changeCharacterRegistry(address registry) public onlyOwner {
        characterRegistry = registry;
    }

    function changeWeaponRegistry(address registry) public onlyOwner {
        weaponRegistry = registry;
    }

    function changeServerCreationFee(uint fee) public onlyOwner {
        serverCreationFee = fee * 1 finney;
    }

    function changeCheatWarrant(uint warrant) public onlyOwner {
        cheatWarrant = warrant * 1 finney;
    }

    function changeBlameThreshold(uint threshold) public onlyOwner {
        blameThreshold = threshold;
    }

    function changeTimeoutThreshold(uint threshold) public onlyOwner {
        timeoutThreshold = threshold;
    }

    function addServer(string name, uint8 max, uint fee, uint moneyBag) public payable {
        require(max > 1 && max <= 8);
        require(msg.value == serverCreationFee);
        Server memory newServer;
        newServer.id = serverNumber;
        newServer.fee = fee * 1 finney;
        newServer.moneyBag = moneyBag * 1 finney;
        newServer.currentMatchId = 0;
        newServer.name = name;
        newServer.owner = msg.sender;
        newServer.state = 0;
        newServer.playerMax = max;
        newServer.playerNb = 0;

        newServer.currentTimeoutTimestamp = 0;
        newServer.currentTimeoutPlayer = 0;
        newServer.currentTimeoutTurn = 0;
        newServer.currentTimeoutClaimer = msg.sender;

        /* newServer.blamed = 0;
        newServer.timeoutStart = 0;
        newServer.lastConfirmedTurn = 0;
        newServer.lastConfirmedTurnPlayer = 0; */

        servers.push(newServer);

        // Update general information
        serverUserIndex[msg.sender][serverUserNumber[msg.sender]] = serverNumber;
        serverUserNumber[msg.sender] += 1;
        serverNumber += 1;

        // Transfer fee to contract owner
        owner.transfer(msg.value);
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

    function addBuildingToServer(uint indexServer, uint8[10] x, uint8[10] y, uint[10] weapon, uint8 nbBuilding) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);
        require(nbBuilding <= 10 && nbBuilding > 0);

        // Add building
        for(uint8 i=0; i<nbBuilding; i++) {
            require(x[i] < 8 && y[i] < 8);
            require(servers[indexServer].buildings[x[i]][y[i]] == 0);

            // Verify weapon exists
            WeaponRegistry reg = WeaponRegistry(weaponRegistry);
            require(weapon[i] < reg.getWeaponNumber());

            servers[indexServer].buildings[x[i]][y[i]] = 2 + weapon[i];
        }
    }

    function removeBuildingFromServer(uint indexServer, uint8[10] x, uint8[10] y, uint8 nbBuilding) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);
        require(nbBuilding <= 10 && nbBuilding > 0);

        // Add building
        for(uint8 i=0; i<nbBuilding; i++) {
            require(x[i] < 8 && y[i] < 8);
            require(servers[indexServer].buildings[x[i]][y[i]] > 0);
            servers[indexServer].buildings[x[i]][y[i]] = 0;
        }
    }

    function addPlayerToServer(uint character, uint server) public payable {
        require(server < serverNumber);
        require(servers[server].state == 1);
        require(characterServer[character] == 0);
        require(servers[server].playerNb < servers[server].playerMax);

        // Verify value
        uint sumValue = servers[server].fee + servers[server].moneyBag + cheatWarrant;
        require(msg.value == sumValue);

        // Verify character exists and subcribes it
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        require(character < reg.totalSupply());
        require(msg.sender == reg.ownerOf(character));
        characterServer[character] = server+1;

        // Create player
        uint8 numero = servers[server].playerNb;
        Player memory newPlayer;
        newPlayer.characterIndex = character;
        newPlayer.owner = msg.sender;

        // Player information for server
        servers[server].players[numero] = newPlayer;
        servers[server].playerIndex[msg.sender] = numero+1;

        servers[server].playerNb += 1;
    }


    function removePlayerFromServer(uint server) public {
        require(server < serverNumber);
        require(servers[server].state == 1);
        require(servers[server].playerNb > 0);

        // Get the player of the caller
        uint8 p = servers[server].playerIndex[msg.sender];
        require(p > 0);
        p -= 1;

        // Remove player from server
        servers[server].playerIndex[msg.sender] = 0;
        characterServer[servers[server].players[p].characterIndex] = 0;

        // Reindexation if he was not the last player
        if(p < servers[server].playerNb-1) {
            servers[server].players[p] = servers[server].players[servers[server].playerNb-1];
            servers[server].playerIndex[servers[server].players[p].owner] = p;
        }

        // The caller get back his money
        uint sumValue = servers[server].fee + servers[server].moneyBag + cheatWarrant;
        msg.sender.transfer(sumValue);

        servers[server].playerNb -= 1;
    }

    function startServer(uint server) public {
        require(server < serverNumber);
        require(servers[server].playerNb == servers[server].playerMax);
        // require(servers[server].owner == msg.sender);  // not necessary in fact

        uint8 maxPlayer = servers[server].playerMax;
        int random = int(keccak256(block.timestamp));
        for(uint8 i=0; i<maxPlayer; i++) {

            // Search randomly for not used position
            do {
              random = int(keccak256(random));
              if(random < 0) {
                  random *= -1;
              }
              uint8 x = uint8(random%maxPlayer);
              random = int(keccak256(random));
              if(random < 0) {
                  random *= -1;
              }
              uint8 y = uint8(random%maxPlayer);
            } while (servers[server].playersPosition[x][y] > 0);

            // Set the new position for the player
            servers[server].playersPosition[x][y] = i+1;
            servers[server].players[i].initialX = x;
            servers[server].players[i].initialY = y;
        }

        // Start the server
        servers[server].state = 2;
        servers[server].currentMatchId = matchNb+1;
        serverMatch[matchNb] = server+1;
        matchNb += 1;

        // Owner get the fees
        servers[server].owner.transfer(servers[server].fee * maxPlayer);
    }


    ///////////////////////////////////////////////////////////////
    /// Server functions

    // Servers informations

    function getServerNb() public view returns(uint nbRet) {
        return serverNumber;
    }

    function getCheatWarrant() public view returns(uint cheatWarrantRet) {
        return cheatWarrant;
    }

    function getServerCreationFee() public view returns(uint serverCreationFeeRet) {
        return serverCreationFee;
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

    function getServerInfo(uint indexServer) public view returns(string nameRet, uint id, uint8 playerMaxRet, uint8 playerNbRet) {
        require(indexServer < serverNumber);
        return (servers[indexServer].name, servers[indexServer].id, servers[indexServer].playerMax, servers[indexServer].playerNb);
    }

    function getServerFinancial(uint indexServer) public view returns(uint feeRet, uint moneyBagRet) {
        require(indexServer < serverNumber);
        return(servers[indexServer].fee, servers[indexServer].moneyBag);
    }

    function getServerBuilding(uint indexServer, uint8 x, uint8 y) public view returns(uint buildingRet) {
        require(indexServer < serverNumber);
        require(x < 8);
        require(y < 8);

        return servers[indexServer].buildings[x][y];
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

    //////////////////////////////////////////////////////////////////
    // Turn simulation

    // idMove:
    // 0: Simple move
    // 1: Simple attack
    // 2: Explore building
    // 3: Weapon
    // 4: Nuja power
    // 5: Idle
    function simulate(uint indexServer, uint8 p, uint8 idMove, uint8 xMove, uint8 yMove, uint8 indexWeapon, uint[176] moveInput) public view returns (uint[176] moveOutput) {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 2);
        require(idMove < 6);
        require(xMove < 8 && yMove < 8);
        require(p < servers[indexServer].playerMax);
        require(isAlive(moveInput, p));

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

        return damage(moveInput, opponent, 100);
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
    // Match functions


    function moveOwner(
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

        return ecrecover(msg, v, bytes32(r), bytes32(s));
    }

    function nextTurn(
      uint indexServer,
      uint[3] metadata,
      uint[176] moveOutput
      ) internal view returns (uint[3] metadataRet) {

        // We skip dead player
        do {
            metadata[2]++;
            if(uint(metadata[2]) >= servers[indexServer].playerNb) {
                metadata[2] = 0;
                metadata[1]++;
            }
        } while (getHealth(moveOutput, metadata[2]) == 0);

        return(metadata);
    }

    function verifyNextTurn(uint indexServer, uint[3] metadata, uint[3] metadataNext, uint[176] moveOutput) internal view {
        uint[3] memory newMetadata = nextTurn(indexServer, metadata, moveOutput);
        require(newMetadata[0] == metadataNext[0]);
        require(newMetadata[1] == metadataNext[1]);
        require(newMetadata[2] == metadataNext[2]);
    }


    function isKilled(uint indexServer, uint8 p) public view returns (bool isRet) {
        require(indexServer < serverNumber);
        require(servers[indexServer].currentMatchId > 0);

        return deadPlayer[servers[indexServer].currentMatchId-1][p];
    }

    // Useful for iterative function
    function getKilledArray(uint indexServer) public view returns (bool[8] killedRet) {
        require(indexServer < serverNumber);
        require(servers[indexServer].currentMatchId > 0);

        bool[8] memory killedArray;

        for(uint8 i=0; i<8; i++) {
            if(deadPlayer[servers[indexServer].currentMatchId-1][i]) {
                killedArray[i] = true;
            }
            else {
                killedArray[i] = false;
            }
        }

        return killedArray;
    }


    function killPlayer(
      uint indexServer,
      uint8 killer,
      uint8 killed,
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
        require(metadata[0][0] == servers[indexServer].currentMatchId-1);
        require(metadata[0][2] < servers[indexServer].playerMax);
        require(!deadPlayer[metadata[0][0]][killed]);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            originState = getInitialState(indexServer);
        }
        else {
            require(nbSignature == servers[indexServer].playerNb);
        }

        // Verify the killer is the last player
        require(metadata[nbSignature-1][2] == killer);

        // Verify the killed has been actually killed in the last turn
        if(nbSignature == 1) {
            require(isAlive(originState, killed) && !(isAlive(moveOutput[0], killed)));
        }
        else {
            require(isAlive(moveOutput[nbSignature-2], killed) && !(isAlive(moveOutput[nbSignature-1], killed)));
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
                    simulatedTurn = simulate(indexServer, uint8(metadata[i][2]), move[i][0], move[i][1], move[i][2], move[i][3], originState);
                }
                else {
                    simulatedTurn = simulate(indexServer, uint8(metadata[i][2]), move[i][0], move[i][1], move[i][2], move[i][3], moveOutput[i-1]);
                }
            }

            // Verify integrity
            //require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

            // If not the last turn check the next turn is correctly the next player
            if(i < nbSignature-1) {
                verifyNextTurn(indexServer, metadata[i], metadata[i+1], moveOutput[i]);
            }
        }

        // Kill the player
        removePlayer(indexServer, killed);

        // Get the fund of the killed
        //servers[indexServer].players[killer].owner.transfer(servers[indexServer].moneyBag);

        // The killed has not cheat, he get his warrant back
        //servers[indexServer].players[killed].owner.transfer(cheatWarrant);

        // If it was the last player, terminate the server
        if(servers[indexServer].playerNb == 1) {
            terminateServer(indexServer, killer);
        }
    }

    function removePlayer(uint indexServer, uint8 killed) internal {
        servers[indexServer].playerNb -= 1;

        // Set player to dead
        deadPlayer[servers[indexServer].currentMatchId-1][killed] = true;

        // Set character server to 0
        uint character = servers[indexServer].players[killed].characterIndex;
        characterServer[character] = 0;
    }

    function terminateServer(uint indexServer, uint8 winner) internal {
        // Reset server
        servers[indexServer].playerNb = 0;
        servers[indexServer].state = 1;
        servers[indexServer].currentTimeoutTimestamp = 0;
        servers[indexServer].currentTimeoutPlayer = 0;
        servers[indexServer].currentTimeoutTurn = 0;

        // Winner get his money back
        //servers[indexServer].players[winner].owner.transfer(servers[indexServer].moneyBag + cheatWarrant);
    }


    //////////////////////////////////////////////////////////////////
    // Dispute functions
    //////////////////////////////////////////////////////////////////

    //////////////////////////////////////////////////////////////////
    // Timeout functions

    /* function isTimeout(uint indexServer) public view returns(bool isRet) {
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
    } */


    //////////////////////////////////////////////////////////////////
    // Cheat functions

    /* function blamePending(uint indexServer) public view returns(bool pendingRet) {
        require(indexServer < serverNumber);
        return (servers[indexServer].blamed > 0);
    }

    function getBlameInfo(uint indexServer) public view returns(uint8 blamed, uint8 blamer, uint blameTimestamp, uint blameTurn, uint blameTurnPlayer) {
        require(indexServer < serverNumber);
        return (servers[indexServer].blamed, servers[indexServer].blamer, servers[indexServer].blameTimestamp, servers[indexServer].blameTurn, servers[indexServer].blameTurnPlayer);
    }

    // Called by anybody to blame a cheater
    // The blamed cheater will have a timeout to prove he hasn't cheated
    function blame(
      uint indexServer,
      uint[8][3] metadata,
      uint8[8][4] move,
      uint[8][176] moveOutput,
      uint[8] r,
      uint[8] s,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
      ) public {
        require(indexServer < serverNumber);
        require(nbSignature > 0);
        require(metadata[0][0] == servers[indexServer].currentMatchId-1);
        require(metadata[0][2] < servers[indexServer].playerMax);
        require(servers[indexServer].playerIndex[msg.sender] > 0);

        // Check if it is the first turn
        // During first turn not all alive player are required to be part of the signatures list
        if(metadata[0][1] == 0 && metadata[0][2] == 0) {
            bool begining = true;
        }
        else {
            begining = false;
        }

        // If not the begining, all alive player should be part of the signature list
        if(!begining) {
            require(nbSignature == servers[indexServer].playerNb);
        }
        else {
            // If we are at begining, the originState is the initial state
            originState = getInitialState(indexServer);
        }

        // Verify all signatures
        for(uint8 i=0; i<nbSignature; i++) {

            // Verify that the move have been signed by the player
            require(moveOwner(metadata[i], move[i], moveOutput[i], r[i], s[i], v[i]) == servers[indexServer].players[metadata[i][2]].owner);

            // Simulate the turn and verify the simulated output is the given output
            if(i == 0) {
                uint[176] memory simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], originState);
            }
            else {
                simulatedTurn = simulate(indexServer, move[i][0], move[i][1], move[i][2], move[i][3], moveOutput[i-1]);
            }

            if(i < nbSignature-1) {
                // If not the last signature we use require to be sure the signature list is valid
                require(keccak256(simulatedTurn) == keccak256(moveOutput[i]));

                // If not the last turn check the next turn is correctly the next player
                uint[3] memory newMetadata = nextTurn(indexServer, metadata[i], moveOutput[i]);
                require(newMetadata[0] == metadata[i+1][0]);
                require(newMetadata[1] == metadata[i+1][1]);
                require(newMetadata[2] == metadata[i+1][2]);
            }
            else {
                // If it is the last signature, if it is the last signature and the simulated output doesn't correspond
                // then we can blame the cheater
                require(keccak256(simulatedTurn) != keccak256(moveOutput[i]));
            }
        }

        // Register the blamed user
        servers[indexServer].blamer = servers[indexServer].playerIndex[msg.sender]-1;
        servers[indexServer].blamed = metadata[nbSignature-1][2] + 1;
        servers[indexServer].blameTimestamp = now;
        servers[indexServer].blameTurn = metadata[nbSignature-1][1];
        servers[indexServer].blameTurnPlayer = metadata[nbSignature-1][2];
    }

    // Called by blamed cheater to prove he hasn't cheated
    // If the protest succeed, the blamer is kicked
    function protest(
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
    }

    // If the blamed cheater hasn't prove in time, he's kicked
    function confirmBlame(uint indexServer) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].blamed > 0);
        require(servers[indexServer].blameTimestamp + blameThreshold > now);

        uint8 blamer = servers[indexServer].blamer;
        uint8 blamed = servers[indexServer].blamed;

        // Kick blamed player
        servers[indexServer].dead[killed] = true;
        servers[indexServer].playerNb -= 1;

        // Blamer get money from cheater
        servers[indexServer].blamer.transfer(servers[indexServer].moneyBag);
        servers[indexServer].blamer.transfer(cheatWarrant);

        // No user to blame anymore
        servers[indexServer].blamed = 0;
    } */
}
