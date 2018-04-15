pragma solidity ^0.4.2;

contract Weapon {
    // Server registry
    address constant SERVERREGISTRY = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

    modifier fromServer {
        require(msg.sender == SERVERREGISTRY);
        _;
    }

    // Type of the weapon
    // This value will change how the front end will call the contract
    // 0: the weapon use only x and y position (launch a bomb)
    // 1: the weaopon just use one direction (limited scope weapon)
    // 2: the weapon use one direction and x and y coordinates (charge with a sword)
    function getType() public pure returns (uint8 weaponType);

    // Must return ipfs hash
    // the repository must at least contain image.png and name/default
    function getMetadata() public pure returns (string metadata);

    // Function called by server to use the Weapon
    // Must be only called from the server repository to get the weapon verified
    function use(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public;
}
