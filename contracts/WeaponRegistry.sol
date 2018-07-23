pragma solidity ^0.4.2;

contract WeaponRegistry {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Attributes
    address owner;
    uint8 weaponNumber;
    address[] weaponArray;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function WeaponRegistry() public {
        owner = msg.sender;
        weaponNumber = 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin functions

    function addWeapon(address weaponContract) public onlyOwner {
        // Weapons max number
        require(weaponNumber <= 250);
        weaponArray.push(weaponContract);
        weaponNumber += 1;
    }

    function getContract(uint8 index) public constant returns (address contractRet) {
        require(index < weaponNumber);

        return weaponArray[index];
    }

    // Get functions
    function getOwner() public view returns(address ret) {
        return owner;
    }

    function getWeaponNumber() public view returns(uint8 ret) {
        return weaponNumber;
    }
}
