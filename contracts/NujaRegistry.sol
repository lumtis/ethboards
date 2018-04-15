pragma solidity ^0.4.2;

import "./Nuja.sol";

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
    Address[] nujaArray;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function NujaRegistry() public {
        owner = msg.sender;
        nujaNumber = 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin functions

    function addNuja(address contract) public onlyOwner {
        nujaArray.push(contract);
        nujaNumber += 1;
    }

    function tokenMetadata(uint256 index) constant returns (string metadataRet) {
        require(index < nujaNumber);
        Nuja n = Nuja(nujaArray[index]);

        return n.getMetadata();
    }

    // Get functions
    function getOwner() public view returns(address ret) {
        return owner;
    }

    function getNujaNumber() public view returns(uint ret) {
        return nujaNumber;
    }
}
