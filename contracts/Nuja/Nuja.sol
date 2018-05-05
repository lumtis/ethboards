pragma solidity ^0.4.2;

import "../Geometry.sol";

contract Nuja is Geometry {
    // registries
    address constant SERVERREGISTRY = 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0;

    modifier fromServer {
        require(msg.sender == SERVERREGISTRY);
        _;
    }

    function getMetadata() public constant returns (string metadata);

    // Function called by server to use the Weapon
    // Must be only called from the server repository to get the weapon verified
    function power(uint serverId, uint8 x, uint8 y, uint8 player) public;
}
