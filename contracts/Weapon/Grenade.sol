pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Grenade is Weapon {


    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmRuvVtRLebZAtYqq1NaH7oGQEMrkKsWv3BEEw4UjLJc22';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        // fieldInformation(uint indexServer, uint8 x, uint8 y) returns(uint8 buildingRet, uint8 characterRet)
        // playerInformation(uint indexServer, uint8 indexPlayer) returns(uint characterIndex, uint8 health, uint8 positionX, uint8 positionY, uint weaponNumber)
        // playerWeapons(uint indexServer, uint8 indexPlayer, uint8 indexWeapon) returns(uint8 weapon)
        // movePlayer(uint indexServer, uint8 indexPlayer, uint8 x, uint8 y)
        // changeHealth(uint indexServer, uint8 indexPlayer, uint8 newHealth)
        // addWeapon(uint indexServer, uint8 indexPlayer, uint8 weapon)
        // removeWeapon(uint indexServer, uint8 indexPlayer, uint8 indexWeapon)

        require(x > 0 && x < 9 && y > 0 && y < 9);

        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d > 0 && d < 4);

        var (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y-1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y-1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y-1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 50); // Center player takes more damage
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y+1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y+1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
        (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y+1);
        if (rr_p > 0) {
            nujaContract.damage(serverId, rr_p-1, 30);
        }
    }
}
