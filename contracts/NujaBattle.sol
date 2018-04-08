pragma solidity ^0.4.2;


contract NujaBattle {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Structures

    struct Character {
        string name;
        uint8 health;
        bool isPlaying;
        uint8 number;
        address owner;
        uint8 positionX;
        uint8 positionY;
        string ipfs;
    }

    struct Field {
        uint8 building;
        uint8 character;
    }

    /* struct Server { */
    uint8 playerNb;
    uint8 turnPlayer;
    uint turnGame;
    mapping (uint => mapping (uint => Field)) fields;
    mapping (address => uint8) players;
    /* } */

    ///////////////////////////////////////////////////////////////
    /// Constants

    string constant NAME = "Nujak token";
    string constant SYMBOL = "NUJ";

    ///////////////////////////////////////////////////////////////
    /// Attributes

    address owner;
    uint256 characterNb;
    Character[] characters;
    uint256 serverNb;
    //Server[] servers;
    uint serverFee;
    uint characterFee;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function NujaBattle() public {
        owner = msg.sender;
        characterNb = 0;
        serverNb = 0;
        serverFee = 0;
        characterFee = 0;

        // Test character
        Character memory character1 = Character('nujak', 100, false, 0, 0x627306090abaB3A6e1400e9345bC60c78a8BEf57, 0, 0, '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9');
        characters.push(character1);
        Character memory character2 = Character('nujaka', 100, false, 1, 0xf17f52151EbEF6C7334FAD080c5704D77216b732, 0, 0, '/ipfs/QmdYwL1FU8WvDXtUaWtmsXUW568RJRS9exGc8cbeaHUXdK');
        characters.push(character2);
        characterNb += 2;

        players[0x627306090abaB3A6e1400e9345bC60c78a8BEf57] = 1;
        players[0xf17f52151EbEF6C7334FAD080c5704D77216b732] = 2;
    }


    ///////////////////////////////////////////////////////////////
    /// Test zone
    function moveUpLeft(uint8 p) internal {
        require(characters[p].positionY > 0);
        require(characters[p].positionX > 0);
        require(fields[characters[p].positionX-1][characters[p].positionY-1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY-1;
        characters[p].positionX = characters[p].positionX-1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveUp(uint8 p) internal {
        require(characters[p].positionY > 0);
        require(fields[characters[p].positionX][characters[p].positionY-1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY-1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveUpRight(uint8 p) internal {
        require(characters[p].positionY > 0);
        require(characters[p].positionX < 9);
        require(fields[characters[p].positionX+1][characters[p].positionY-1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY-1;
        characters[p].positionX = characters[p].positionX+1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveRight(uint8 p) internal {
        require(characters[p].positionX < 9);
        require(fields[characters[p].positionX+1][characters[p].positionY].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionX = characters[p].positionX+1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveDownRight(uint8 p) internal {
        require(characters[p].positionY < 9);
        require(characters[p].positionX < 9);
        require(fields[characters[p].positionX+1][characters[p].positionY+1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY+1;
        characters[p].positionX = characters[p].positionX+1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveDown(uint8 p) internal {
        require(characters[p].positionY < 9);
        require(fields[characters[p].positionX][characters[p].positionY+1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY+1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveDownLeft(uint8 p) internal {
        require(characters[p].positionY < 9);
        require(characters[p].positionX > 0);
        require(fields[characters[p].positionX-1][characters[p].positionY+1].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionY = characters[p].positionY+1;
        characters[p].positionX = characters[p].positionX-1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }
    function moveLeft(uint8 p) internal {
        require(characters[p].positionX > 0);
        require(fields[characters[p].positionX-1][characters[p].positionY].character == 0);

        fields[characters[p].positionX][characters[p].positionY].character = 0;
        characters[p].positionX = characters[p].positionX-1;
        fields[characters[p].positionX][characters[p].positionY].character = p+1;
    }


    function attackUpLeft(uint8 p) internal {
        require(fields[characters[p].positionX-1][characters[p].positionY-1].character > 0);
    }
    function attackUp(uint8 p) internal {
        require(fields[characters[p].positionX][characters[p].positionY-1].character > 0);
    }
    function attackUpRight(uint8 p) internal {
        require(fields[characters[p].positionX+1][characters[p].positionY-1].character > 0);
    }
    function attackRight(uint8 p) internal {
        require(fields[characters[p].positionX+1][characters[p].positionY].character > 0);
    }
    function attackDownRight(uint8 p) internal {
        require(fields[characters[p].positionX+1][characters[p].positionY+1].character > 0);
    }
    function attackDown(uint8 p) internal {
        require(fields[characters[p].positionX][characters[p].positionY+1].character > 0);
    }
    function attackDownLeft(uint8 p) internal {
        require(fields[characters[p].positionX-1][characters[p].positionY+1].character > 0);
    }
    function attackLeft(uint8 p) internal {
        require(fields[characters[p].positionX-1][characters[p].positionY].character > 0);
    }


    function deployServer() public {
        uint seed = uint(keccak256(block.timestamp));

        // City
        uint city = 10;
        while (city > 0) {
            seed = uint(keccak256(seed));
            uint x = seed%10;
            seed = uint(keccak256(seed));
            uint y = seed%10;

            fields[x][y].building = 1;

            city -= 1;
        }

        characters[0].positionX = 3;
        characters[0].positionY = 3;
        fields[3][3].character = 1;

        characters[1].positionX = 7;
        characters[1].positionY = 7;
        fields[7][7].character = 2;

        playerNb = 2;
        turnPlayer = 0;
        turnGame = 0;
    }

    function getField(uint x, uint y) public view returns(uint8 buildingRet, uint8 characterRet) {
        require(x < 10);
        require(y < 10);

        return (fields[x][y].building, fields[x][y].character);
    }

    function getPlayerInfo(uint index) public view returns(string nameRet, uint healthRet, uint numberRet, address ownerRet, uint8 positionXRet, uint8 positionYRet, string ipfsRet) {
        require(index < 2);

        Character memory c = characters[index];

        return (c.name, c.health, c.number, c.owner, c.positionX, c.positionY, c.ipfs);
    }

    function isTurn(address addr) public view returns(bool ret) {
        uint8 p = players[addr];
        require(p > 0);
        p -= 1;
        return characters[p].number == turnPlayer;
    }

    function play(uint command) public {
        require(command < 16);

        uint8 p = players[msg.sender];
        require(p > 0);
        p -= 1;
        require(characters[p].number == turnPlayer);

        if (command == 0) {
            moveUpLeft(p);
        }
        else if (command == 1) {
            moveUp(p);
        }
        else if (command == 2) {
            moveUpRight(p);
        }
        else if (command == 3) {
            moveRight(p);
        }
        else if (command == 4) {
            moveDownRight(p);
        }
        else if (command == 5) {
            moveDown(p);
        }
        else if (command == 6) {
            moveDownLeft(p);
        }
        else if (command == 7) {
            moveLeft(p);
        }
        else if (command == 8) {
            attackUpLeft(p);
        }
        else if (command == 9) {
            attackUp(p);
        }
        else if (command == 10) {
            attackUpRight(p);
        }
        else if (command == 11) {
            attackRight(p);
        }
        else if (command == 12) {
            attackDownRight(p);
        }
        else if (command == 13) {
            attackDown(p);
        }
        else if (command == 14) {
            attackDownLeft(p);
        }
        else if (command == 15) {
            attackLeft(p);
        }

        turnPlayer = (turnPlayer+1)%playerNb;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin

    function changeCharacterFee(uint newFee) public onlyOwner {
        characterFee = newFee;
    }

    function changeServerFee(uint newFee) public onlyOwner {
        serverFee = newFee;
    }

    ///////////////////////////////////////////////////////////////
    /// Methods

    function getOwner() public view returns(address ret) {
        return owner;
    }

    function getCharacterNb() public view returns(uint256 ret) {
        return characterNb;
    }

    function getServerNb() public view returns(uint256 ret) {
        return serverNb;
    }

    function addCharacter() payable public {
        require(msg.value == characterFee);
    }

    function addServer() payable public {
        require(msg.value == serverFee);
    }
}
