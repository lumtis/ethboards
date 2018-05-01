pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Sword is Weapon {

    function getType() public pure returns (uint8 weaponType) {
        return 2;
    }

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
