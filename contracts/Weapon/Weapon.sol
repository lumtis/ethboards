pragma solidity ^0.4.2;

import "../Geometry.sol";

contract Weapon is Geometry {

    // Server registry
    address constant SERVERREGISTRY = 0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0;

    modifier fromServer {
        require(msg.sender == SERVERREGISTRY);
        _;
    }

    // Must return ipfs hash
    // the repository must at least contain image.png and name/default
    function getMetadata() public pure returns (string metadata);

    // Function called by server to use the Weapon
    // Must be only called from the server repository to get the weapon verified
    function use(uint serverId, uint8 x, uint8 y, uint8 player) public;
}
