pragma solidity ^0.4.2;

import "./Nuja.sol";

contract LeafNujak is Nuja {
    function getMetadata() pure returns (string metadata) {
        return '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromRegistry {

    }
}
