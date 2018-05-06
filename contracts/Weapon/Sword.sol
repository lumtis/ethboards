pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Sword is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmUdDzeAkV9ycXxSGrt6YviAMQAK3i2F2aBPNJASTtF1Uo';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d == 1);

        // Move
        var (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        require(rr_p == 0);
        nujaContract.movePlayer(serverId, player, x, y);

        bool striked = true;
        uint8 strikedX = 0;
        uint8 strikedY = 0;

        // Eventually strike a player
        if (x > r_x && x < 9) {
            strikedX = x + 1;
        }
        else if (x < r_x && x > 0) {
            strikedX = x - 1;
        }
        else if (x == r_x) {
            strikedX = x;
        }
        else {
            striked = false;
        }

        if (y > r_y && y < 9) {
            strikedY = y + 1;
        }
        else if (y < r_y && y > 0) {
            strikedY = y - 1;
        }
        else if (y == r_y) {
            strikedY = y;
        }
        else {
            striked = false;
        }

        if (striked) {
            (rr1, rr_p) = nujaContract.fieldInformation(serverId, strikedX, strikedY);
            if (rr_p > 0) {
                nujaContract.damage(serverId, rr_p-1, 40);
            }
        }
    }
}
