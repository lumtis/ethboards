pragma solidity ^0.4.2;

contract BattleOfNujak {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Attributes

    address owner;
    uint256 characterNb;
    address[] characters;
    uint256 serverNb;
    address[] servers;
    uint serverFee;
    uint characterFee;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function BattleOfNujak() public {
        owner = msg.sender;
        characterNb = 0;
        serverNb = 0;
        serverFee = 1 finney;
        characterFee = 1 finney;
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
