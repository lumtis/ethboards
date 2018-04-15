pragma solidity ^0.4.2;

contract Nuja {
    // registries
    address constant SERVERREGISTRY = 0x627306090abaB3A6e1400e9345bC60c78a8BEf57;

    modifier fromServer {
        require(msg.sender == SERVERREGISTRY);
        _;
    }

    function getMetadata() public constant returns (string metadata);

    // Function called by server to use the Weapon
    // Must be only called from the server repository to get the weapon verified
    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public;
}
