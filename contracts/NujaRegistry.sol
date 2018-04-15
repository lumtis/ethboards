pragma solidity ^0.4.2;

import "./Nuja/Nuja.sol";

contract NujaRegistry {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    ///////////////////////////////////////////////////////////////
    /// Attributes
    address owner;
    uint nujaNumber;
    address[] nujaArray;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function NujaRegistry() public {
        owner = msg.sender;
        nujaNumber = 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin functions

    function addNuja(address nujaContract) public onlyOwner {
        nujaArray.push(nujaContract);
        nujaNumber += 1;
    }

    function getContract(uint256 index) public constant returns (address contractRet) {
        require(index < nujaNumber);

        return nujaArray[index];
    }

    // TODO: implement function to get metadata through 2 byte32 arrays
    /* function tokenMetadata(uint256 index) public constant returns (string metadataRet) {
        require(index < nujaNumber);
        Nuja n = Nuja(nujaArray[index]);

        return n.getMetadata();
    } */

    // Get functions
    function getOwner() public view returns(address ret) {
        return owner;
    }

    function getNujaNumber() public view returns(uint ret) {
        return nujaNumber;
    }
}
