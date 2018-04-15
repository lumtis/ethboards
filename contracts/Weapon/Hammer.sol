pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Hammer is Weapon {

    function getType() pure returns (uint8 type) {
        return 1;
    }

    function getMetadata() pure returns (string metadata) {
        return '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9';
    }

    function use(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
