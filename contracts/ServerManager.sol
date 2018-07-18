/*
  Main contract for matchmaking
*/
pragma solidity ^0.4.2;

import "./CharacterRegistry.sol";
import "./NujaRegistry.sol";
import "./Nuja/Nuja.sol";
import "./WeaponRegistry.sol";
import "./Weapon/Weapon.sol";
import "./Geometry.sol";
import "./StateManager.sol";
import "./NujaBattle.sol";


contract ServerManager is Geometry, StateManager {

    // General values
    address owner;
    address characterRegistry;
    address weaponRegistry;
    address nujaBattle;
    uint serverCreationFee;
    uint cheatWarrant;
    bool addressesSet;

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier fromNujaBattle {
        require(msg.sender == nujaBattle);
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
        /* mapping (uint8 => mapping (uint8 => uint)) playersPosition;   // TODO: Clear player position at match end */
        mapping (uint8 => Player) players;
        mapping (address => uint8) playerIndex;   // Warning: offset
    }

    uint serverNumber;
    Server[] servers;

    // Get the server associated with the match id
    // The value is server.id + 1 because 0 represents not started yet match or ended match
    mapping (uint => uint) serverMatch;
    uint matchNb;

    // Necessary to get user's server
    mapping (address => uint) serverUserNumber;
    mapping (address => mapping (uint => uint)) serverUserIndex;

    // Map character to server
    mapping (uint => uint) characterServer;  // Offset

    ///////////////////////////////////////////////////////////////

    function ServerManager() public {
        owner = msg.sender;
        serverNumber = 0;
        characterRegistry = 0x3e6e5e80f340789b1d58ef49B4d6ea42A4e846D6;
        weaponRegistry = 0x89e6CB10Ee706752F83E19b6C9d74487D0A8DD1e;
        nujaBattle = address(0);
        serverCreationFee = 5 finney;
        cheatWarrant = 5 finney;
        matchNb= 0;
        addressesSet = false;
    }

    ///////////////////////////////////////////////////////////////
    /// Administration functions

    function setAddresses(address nujaBattle_) public onlyOwner {
        require(addressesSet == false);
        nujaBattle = nujaBattle_;
        addressesSet = true;
    }


    function changeServerCreationFee(uint fee) public onlyOwner {
        serverCreationFee = fee * 1 finney;
    }

    function changeCheatWarrant(uint warrant) public onlyOwner {
        cheatWarrant = warrant * 1 finney;
    }


    // Add server to the server list
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

        servers.push(newServer);

        // Update general information
        serverUserIndex[msg.sender][serverUserNumber[msg.sender]] = serverNumber;
        serverUserNumber[msg.sender] += 1;
        serverNumber += 1;

        // Transfer fee to contract owner
        owner.transfer(msg.value);
    }

    // Set the server online, then players can join it
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

    // Add list of buildings to the server
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

    // Remove list of buildings from server
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

    // Owner of a character can add his character to the server
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

    // Remove character from server
    // No chracter id because it can be infered from owner address
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

    // Start the server if it is full
    function startServer(uint server) public {
        require(server < serverNumber);
        require(servers[server].playerNb == servers[server].playerMax);

        uint8 maxPlayer = servers[server].playerMax;
        int random = int(keccak256(block.timestamp));
        for(uint8 i=0; i<maxPlayer; i++) {

            // First version
            servers[server].players[i].initialX = i;
            servers[server].players[i].initialY = i;
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

    // Number of server
    function getServerNb() public view returns(uint nbRet) {
        return serverNumber;
    }

    // Get the cheat warrant value
    function getCheatWarrant() public view returns(uint cheatWarrantRet) {
        return cheatWarrant;
    }

    // Get the server creatin fee calue
    function getServerCreationFee() public view returns(uint serverCreationFeeRet) {
        return serverCreationFee;
    }

    // Get name of a server
    function getServerName(uint indexServer) public view returns(string nameRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].name;
    }

    // Get the id of a server from id of a match
    function getMatchServer(uint idMatch) public view returns(uint serverRet) {
        require(idMatch < matchNb);

        uint serverId = serverMatch[idMatch];
        require(serverId>0);

        return serverId-1;
    }

    // Get current id of the server's match
    function getServerCurrentMatch(uint indexServer) public view returns(uint matchRet) {
        require(indexServer < serverNumber);

        uint matchId = servers[indexServer].currentMatchId;
        require(matchId>0);

        return matchId-1;
    }

    // Get player max number from server
    function getPlayerMax(uint indexServer) public view returns(uint8 playerMaxRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].playerMax;
    }

    // Get player number from server
    // waitig players if not started yet
    // alive players if server is running
    function getPlayerNb(uint indexServer) public view returns(uint8 playerNbRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].playerNb;
    }

    // Get the state of the server
    // 0: server offline
    // 1: online but not started yet
    // 2: online and running
    function getServerState(uint indexServer) public view returns(uint8 stateRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].state;
    }

    // Get some infos from server
    function getServerInfo(uint indexServer) public view returns(string nameRet, uint id, uint8 playerMaxRet, uint8 playerNbRet) {
        require(indexServer < serverNumber);
        return (servers[indexServer].name, servers[indexServer].id, servers[indexServer].playerMax, servers[indexServer].playerNb);
    }

    // Get financial infos from server (fee to join, money bag for player
    function getServerFee(uint indexServer) public view returns(uint feeRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].fee;
    }
    function getServerMoneyBag(uint indexServer) public view returns(uint moneyBagRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].moneyBag;
    }

    // Get building code for position
    // 0: no building
    // 1: empty building
    // n: building with weapon n-2
    function getServerBuilding(uint indexServer, uint8 x, uint8 y) public view returns(uint buildingRet) {
        require(indexServer < serverNumber);
        require(x < 8);
        require(y < 8);

        return servers[indexServer].buildings[x][y];
    }

    // Get the number of server owned by user
    function getServerUserNumber(address user) public view returns(uint serverUserNumberRet) {
        return serverUserNumber[user];
    }

    // Get id of server from owner and index of owned server
    function getServerUserIndex(address user, uint index) public view returns(uint serverUserIndexRet) {
        require(index < serverUserNumber[user]);

        return serverUserIndex[user][index];
    }


    // Specific server information

    // Get the initial state of server (considering building, players position etc)
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
                //state[64+i*8+j] = servers[indexServer].playersPosition[i][j];
                state[64+i*8+j] = 0;
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
            state[64+servers[indexServer].players[i].initialX*8+servers[indexServer].players[i].initialY] = i+1;
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

    // Get user index in server from his address
    function getIndexFromAddress(uint indexServer, address ownerAddress) public view returns(uint8 indexRet) {
        require(indexServer < serverNumber);
        require(servers[indexServer].playerIndex[ownerAddress] > 0);

        return servers[indexServer].playerIndex[ownerAddress]-1;
    }

    // Get address in a server from the index
    function getAddressFromIndex(uint indexServer, uint8 indexPlayer) public view returns(address ownerRet) {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerMax);

        return servers[indexServer].players[indexPlayer].owner;
    }

    // Check if user is present in the server
    function isAddressInServer(uint indexServer, address ownerAddress) public view returns(bool isRet) {
        require(indexServer < serverNumber);

        return (servers[indexServer].playerIndex[ownerAddress] > 0);
    }

    // Get Character index from server and player index
    function playerCharacter(uint indexServer, uint8 indexPlayer) public view returns(uint characterIndex) {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerMax);

        return (servers[indexServer].players[indexPlayer].characterIndex);
    }

    // Get the current server from character
    function getCharacterServer(uint characterId) public view returns(uint serverId) {
        // Verify character exists
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        require(characterId < reg.totalSupply());

        return characterServer[characterId];
    }


    // Server modification

    // Remove player from server
    function removePlayer(uint indexServer, uint8 killed) public fromNujaBattle {
        servers[indexServer].playerNb -= 1;

        // Set player index to 0
        servers[indexServer].playerIndex[servers[indexServer].players[killed].owner] = 0;

        // Set character server to 0
        uint character = servers[indexServer].players[killed].characterIndex;
        characterServer[character] = 0;
    }

    // Terminate the running server
    function terminateServer(uint indexServer, uint8 winner) public fromNujaBattle {
        // Reset server
        removePlayer(indexServer, winner);
        servers[indexServer].state = 1;
        servers[indexServer].currentMatchId = 0;

        // Winner get his money back
        servers[indexServer].players[winner].owner.transfer(servers[indexServer].moneyBag + cheatWarrant);
    }

    // Transfer of fund approved by nuja battle smart contract
    function nujaBattleTransfer(address addr, uint amount) public fromNujaBattle {
        addr.transfer(amount);
    }
}
