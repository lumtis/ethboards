pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Jetpack is Weapon {

    function getType() public pure returns (uint8 weaponType) {
        return 0;
    }

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9';
    }

    function use(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {
        /* fieldInformation(serverId, x, y);
        playerInformation(serverId, player);
        playerWeapons(serverId, player, indexWeapon);

        movePlayer(serverId, player, x, y);
        changeHealth(serverId, player, newHealth);
        addWeapon(serverId, player, weapon);
        removeWeapon(serverId, player, indexWeapon); */

        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        nujaContract.movePlayer(serverId, player, x, y);
    }
}
