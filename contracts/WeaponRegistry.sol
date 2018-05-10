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
    uint weaponNumber;
    address[] weaponArray;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function WeaponRegistry() public {
        owner = msg.sender;
        weaponNumber = 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin functions

    function addNuja(address weaponContract) public onlyOwner {
        weaponArray.push(weaponContract);
        weaponNumber += 1;
    }

    function getContract(uint256 index) public constant returns (address contractRet) {
        require(index < weaponNumber);

        return weaponArray[index];
    }

    // Get functions
    function getOwner() public view returns(address ret) {
        return owner;
    }

    function getWeaponNumber() public view returns(uint ret) {
        return weaponNumber;
    }
}
