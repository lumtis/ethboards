/*
  Main contract for matchmaking
*/
pragma solidity ^0.4.2;

import "CharacterRegistry.sol";
import "NujaRegistry.sol";
import "Nuja.sol";
import "WeaponRegistry.sol";
import "Weapon.sol";
import "StateManager.sol";
import "NujaBattle.sol";


contract BoardList {

    // General values
    address characterRegistry;
    address weaponRegistry;
    address nujaBattle;
    uint serverCreationFee;
    uint cheatWarrant;
    bool addressesSet;

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier fromNujaBattle {
        require(msg.sender == nujaBattle);
        _;
    }


    ///////////////////////////////////////////////////////////////
    /// Structures

    struct PawnPosition {
        uint8 pawnType;
        uint8 x;
        uint8 y;
    }

    struct Board {
        uint id;
        address owner;
        string name;
        uint gameCount;
        bool deployed;
        uint8 pawnTypeNumber;
        uint8 pawnNumber;
        mapping (uint8 => address) pawnTypeAddress;
        mapping (uint8 => PawnPosition) pawnPosition;
    }

    uint boardNumber;
    Board[] boards;

    // Get the server associated with the match id
    // The value is server.id + 1 because 0 represents not started yet match or ended match
    mapping (uint => uint) serverMatch;
    uint matchNb;

    // Necessary to get user's server
    mapping (address => mapping (uint => uint)) serverUserIndex;

    // Map character to server
    mapping (uint => uint) characterServer;  // Offset

    ///////////////////////////////////////////////////////////////

    function BoardList() public {
        boardNumber = 0;
        nujaBattle = address(0);
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

    // Add list of buildings to the server
    function addBuildingToServer(uint indexServer, uint8[10] x, uint8[10] y, uint8[10] weapon, bytes32[10] name, uint8 nbBuilding) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].state == 0);
        require(servers[indexServer].owner == msg.sender);
        require(nbBuilding <= 10 && nbBuilding > 0);

        // Add building
        for(uint8 i=0; i<nbBuilding; i++) {
            require(x[i] < 8 && y[i] < 8);
            require(servers[indexServer].buildings[x[i]*8+y[i]].weapon == 0);

            // Verify weapon exists
            WeaponRegistry reg = WeaponRegistry(weaponRegistry);
            require(weapon[i] < reg.getWeaponNumber());

            servers[indexServer].buildings[x[i]*8+y[i]].weapon = 2 + weapon[i];
            servers[indexServer].buildings[x[i]*8+y[i]].name = name[i];
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
            require(servers[indexServer].buildings[x[i]*8+y[i]].weapon > 0);
            servers[indexServer].buildings[x[i]*8+y[i]].weapon = 0;
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
            // Unique horizontale position
            servers[server].players[i].initialX = (3*i+5)%8;

            // Random vertical position
            random = int(keccak256(random));
            if(random < 0) {
                random *= -1;
            }
            uint8 y = uint8(random%8);
            servers[server].players[i].initialY = y;
            /* servers[server].players[i].initialX = i;
            servers[server].players[i].initialY = i; */
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

        serverRet = serverMatch[idMatch];
        require(serverRet>0);

        return serverRet-1;
    }

    // Get current id of the server's match
    function getServerCurrentMatch(uint indexServer) public view returns(uint matchRet) {
        require(indexServer < serverNumber);

        matchRet = servers[indexServer].currentMatchId;
        require(matchRet>0);

        return matchRet-1;
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

    // Get building weapon code for position
    // 0: no building
    // 1: empty building
    // n: building with weapon n-2
    function getServerBuildingWeapon(uint indexServer, uint8 x, uint8 y) public view returns(uint8 weaponRet) {
        require(indexServer < serverNumber);
        require(x < 8);
        require(y < 8);

        return servers[indexServer].buildings[x*8+y].weapon;
    }

    function getServerBuildingName(uint indexServer, uint8 x, uint8 y) public view returns(bytes32 nameRet) {
        require(indexServer < serverNumber);
        require(x < 8);
        require(y < 8);

        return servers[indexServer].buildings[x*8+y].name;
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



    // Get the initial state of the board
    function getInitialState(uint boardId) public view returns(uint8[121] state) {
        require(boardId < boardNumber, "The board doesn't exist");

        // Pawn number
        state[0] = boards[boardId].pawnNumber;

        for(i = 0; i<boards[boardId].pawnNumber; i++) {
             // Pawn type
            state[1+i] = boards[boardId].PawnPosition[i].pawnType;
            // Pawn x position
            state[41+i] = boards[boardId].PawnPosition[i].x;
            // Pawn y position
            state[81+i] = boards[boardId].PawnPosition[i].y;
        }

        return state;
    }
}
