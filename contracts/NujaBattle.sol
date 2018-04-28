pragma solidity ^0.4.2;


import "./Weapon/Weapon.sol";
import "./CharacterRegistry.sol";

contract NujaBattle {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Structures

    struct Field {
        uint8 building;
        uint8 character; // Warning: offset
    }

    struct Player {
        uint characterIndex;
        uint8 health;
        uint8 number;
        uint8 positionX;
        uint8 positionY;
        uint8[] weapons;
    }

    struct Server {
        string name;
        address owner;
        uint8 playerNb;
        uint8 turnPlayer;
        uint turnGame;
        mapping (uint8 => mapping (uint8 => Field)) fields;

        /* Player[] players; */
        mapping (uint8 => Player) players;

        mapping (address => uint8) playerIndex;   // Warning: offset
        address[] weapons;
        mapping (address => bool) trusted;
    }

    address owner;
    uint serverNumber;
    Server[] servers;
    address characterRegistry;


    function NujaBattle() public {
        owner = msg.sender;
        serverNumber = 0;
        characterRegistry = address(0);
    }

    ///////////////////////////////////////////////////////////////
    /// Basic functions

    function changeCharacterRegistry(address registry) public onlyOwner {
        characterRegistry = registry;
    }

    function addServer(string name) public {
        Server memory newServer;
        newServer.name = name;
        newServer.owner = msg.sender;
        newServer.playerNb = 0;
        newServer.turnPlayer = 0;
        newServer.turnGame = 0;
        servers.push(newServer);

        serverNumber += 1;
    }

    // Server utilities
    function addWeaponToServer(uint indexServer, address weapon) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].owner == msg.sender);
        // We verify weapon is not already added
        require(servers[indexServer].trusted[weapon] == false);

        servers[indexServer].weapons.push(weapon);
        servers[indexServer].trusted[weapon] = true;
    }

    function addBuildingToServer(uint indexServer, uint8 x, uint8 y) public {
        require(indexServer < serverNumber);
        require(servers[indexServer].owner == msg.sender);
        require(x < 10 && y < 10);
        require(servers[indexServer].fields[x][y].building == 0);

        servers[indexServer].fields[x][y].building = 2;
    }

    function addPlayerToServer(uint character, uint server) public {
        require(server < serverNumber);
        require(servers[server].playerNb < 10);

        // Verify character exists and subcribes it
        CharacterRegistry reg = CharacterRegistry(characterRegistry);
        require(character < reg.totalSupply());
        require(msg.sender == reg.ownerOf(character));
        reg.setCharacterServer(character, server);

        // Create player
        uint8 numero = servers[server].playerNb;
        Player memory newPlayer;
        newPlayer.characterIndex = character;
        newPlayer.health = 100;
        newPlayer.number = numero;
        newPlayer.positionX = numero;
        newPlayer.positionY = numero;

        // Player information for server
        /* servers[server].players.push(newPlayer); */
        servers[server].players[servers[server].playerNb] = newPlayer;

        servers[server].fields[numero][numero].character = numero+1;
        servers[server].playerIndex[msg.sender] = numero+1;

        servers[server].playerNb += 1;
    }


    ///////////////////////////////////////////////////////////////
    /// Server functions

    function isTurn(uint indexServer, address addr) public view returns(bool ret) {
        require(indexServer < serverNumber);
        uint8 p = servers[indexServer].playerIndex[addr];
        require(p > 0);
        p -= 1;
        return servers[indexServer].players[p].number == servers[indexServer].turnPlayer;
    }

    function getServerName(uint indexServer) public view returns(string nameRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].name;
    }

    function getServerNb() public view returns(uint nbRet) {
        return serverNumber;
    }

    function getPlayerNb(uint indexServer) public view returns(uint8 playerNbRet) {
        require(indexServer < serverNumber);
        return servers[indexServer].playerNb;
    }

    function getWeaponAddress(uint indexServer, uint8 weapon) public view returns(address addrRet) {
        require(indexServer < serverNumber);
        require(weapon < servers[indexServer].weapons.length);
        return servers[indexServer].weapons[weapon];
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

    // Interface for nuja and weapon

    // views
    function fieldInformation(uint indexServer, uint8 x, uint8 y) public view returns(uint8 buildingRet, uint8 characterRet) {
        require(indexServer < serverNumber);
        require(x < 10);
        require(y < 10);

        return (servers[indexServer].fields[x][y].building, servers[indexServer].fields[x][y].character - 1);
    }
    function playerInformation(uint indexServer, uint8 indexPlayer) public view returns(uint characterIndex, uint8 health, uint8 positionX, uint8 positionY, uint weaponNumber) {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);

        return (servers[indexServer].players[indexPlayer].characterIndex, servers[indexServer].players[indexPlayer].health, servers[indexServer].players[indexPlayer].positionX, servers[indexServer].players[indexPlayer].positionY, servers[indexServer].players[indexPlayer].weapons.length);
    }
    function playerWeapons(uint indexServer, uint8 indexPlayer, uint8 indexWeapon) public view returns(uint8 weapon) {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);
        require(indexWeapon < servers[indexServer].players[indexPlayer].weapons.length);

        return (servers[indexServer].players[indexPlayer].weapons[indexWeapon]);
    }

    // actions
    function movePlayer(uint indexServer, uint8 indexPlayer, uint8 x, uint8 y) public {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);
        require(servers[indexServer].trusted[msg.sender]);    // To implement: trusted nuja
        require(x < 10 && y < 10);

        require(servers[indexServer].fields[x][y].character == 0);

        servers[indexServer].fields[servers[indexServer].players[indexPlayer].positionX][servers[indexServer].players[indexPlayer].positionY].character = 0;
        servers[indexServer].players[indexPlayer].positionY = y;
        servers[indexServer].players[indexPlayer].positionX = x;
        servers[indexServer].fields[x][y].character = indexPlayer+1;
    }
    function changeHealth(uint indexServer, uint8 indexPlayer, uint8 newHealth) public {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);
        require(servers[indexServer].trusted[msg.sender]);    // To implement: trusted nuja
        require(newHealth >= 0 && newHealth <= 100);

        servers[indexServer].players[indexPlayer].health = newHealth;
    }
    function addWeapon(uint indexServer, uint8 indexPlayer, uint8 weapon) public {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);
        require(servers[indexServer].trusted[msg.sender]);    // To implement: trusted nuja
        require(weapon < servers[indexServer].weapons.length);

        servers[indexServer].players[indexPlayer].weapons.push(weapon);
    }
    function removeWeapon(uint indexServer, uint8 indexPlayer, uint8 indexWeapon) public {
        require(indexServer < serverNumber);
        require(indexPlayer < servers[indexServer].playerNb);
        require(servers[indexServer].trusted[msg.sender]);    // To implement: trusted nuja

        uint nbWeapon = servers[indexServer].players[indexPlayer].weapons.length;
        require(indexWeapon < nbWeapon);

        servers[indexServer].players[indexPlayer].weapons[indexWeapon] = servers[indexServer].players[indexPlayer].weapons[nbWeapon-1];
        delete servers[indexServer].players[indexPlayer].weapons[nbWeapon-1];
        servers[indexServer].players[indexPlayer].weapons.length--;
    }


    // Playing your turn
    // playMove:
    // 0: Simple move
    // 1: Simple attack
    // 2: Explore building
    // 3: Weapon
    // 4: Nuja power
    function play(uint indexServer, uint8 playMove, uint index, uint8 x, uint8 y, uint8 dir) public {
        require(indexServer < serverNumber);
        require(playMove < 5);

        uint8 p = servers[indexServer].playerIndex[msg.sender];
        require(p > 0);
        p -= 1;
        require(servers[indexServer].players[p].number == servers[indexServer].turnPlayer);

        if (playMove == 0) {
            require(index < 8);
            move(indexServer, p, uint8(index));
        }
        else if (playMove == 1) {
            require(index < 8);
            attack(indexServer, p, uint8(index));
        }
        else if (playMove == 2) {
            exploreBuilding(indexServer, p);
        }
        else if (playMove == 3) {
            require(index < servers[indexServer].players[p].weapons.length);
            require(x < 10 && y < 10 && dir < 8);
            Weapon w = Weapon(servers[indexServer].weapons[servers[indexServer].players[p].weapons[index]]);
            w.use(indexServer, dir, x, y, p);
        }
        // TODO: Implement nuja power

        servers[indexServer].turnPlayer = (servers[indexServer].turnPlayer+1)%(servers[indexServer].playerNb);
    }

    function move(uint indexServer, uint8 p, uint8 command) internal {
        if (command == 0) {
            moveUpLeft(indexServer, p);
        }
        else if (command == 1) {
            moveUp(indexServer, p);
        }
        else if (command == 2) {
            moveUpRight(indexServer, p);
        }
        else if (command == 3) {
            moveRight(indexServer, p);
        }
        else if (command == 4) {
            moveDownRight(indexServer, p);
        }
        else if (command == 5) {
            moveDown(indexServer, p);
        }
        else if (command == 6) {
            moveDownLeft(indexServer, p);
        }
        else if (command == 7) {
            moveLeft(indexServer, p);
        }
    }

    function moveUpLeft(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY > 0);
        require(servers[indexServer].players[p].positionX > 0);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY-1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY-1;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX-1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveUp(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY > 0);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY-1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY-1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveUpRight(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY > 0);
        require(servers[indexServer].players[p].positionX < 9);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY-1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY-1;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX+1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveRight(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionX < 9);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX+1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveDownRight(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY < 9);
        require(servers[indexServer].players[p].positionX < 9);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY+1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY+1;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX+1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveDown(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY < 9);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY+1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY+1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveDownLeft(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionY < 9);
        require(servers[indexServer].players[p].positionX > 0);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY+1].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionY = servers[indexServer].players[p].positionY+1;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX-1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }
    function moveLeft(uint indexServer, uint8 p) internal {
        require(servers[indexServer].players[p].positionX > 0);
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY].character == 0);

        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = 0;
        servers[indexServer].players[p].positionX = servers[indexServer].players[p].positionX-1;
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].character = p+1;
    }

    function attack(uint indexServer, uint8 p, uint8 command) internal {
        if (command == 0) {
            attackUpLeft(indexServer, p);
        }
        else if (command == 1) {
            attackUp(indexServer, p);
        }
        else if (command == 2) {
            attackUpRight(indexServer, p);
        }
        else if (command == 3) {
            attackRight(indexServer, p);
        }
        else if (command == 4) {
            attackDownRight(indexServer, p);
        }
        else if (command == 5) {
            attackDown(indexServer, p);
        }
        else if (command == 6) {
            attackDownLeft(indexServer, p);
        }
        else if (command == 7) {
            attackLeft(indexServer, p);
        }
    }

    function attackUpLeft(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY-1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackUp(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY-1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackUpRight(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY-1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackRight(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackDownRight(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX+1][servers[indexServer].players[p].positionY+1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackDown(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY+1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackDownLeft(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY+1].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }
    function attackLeft(uint indexServer, uint8 p) internal {
        uint8 opponent = servers[indexServer].fields[servers[indexServer].players[p].positionX-1][servers[indexServer].players[p].positionY].character;
        require(opponent > 0);
        opponent -= 1;
        fistAttack(indexServer, opponent);
    }

    function fistAttack(uint indexServer, uint8 p) internal {
        if(servers[indexServer].players[p].health <= 10) {
            servers[indexServer].players[p].health = 0;
        }
        else {
            servers[indexServer].players[p].health -= 10;
        }
    }


    function exploreBuilding(uint indexServer, uint8 p) internal {
        require(servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].building == 2);

        // Give object to player
        servers[indexServer].players[p].weapons.push(0);

        // Set building as explored
        servers[indexServer].fields[servers[indexServer].players[p].positionX][servers[indexServer].players[p].positionY].building = 1;
    }
}
