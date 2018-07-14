pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Sword is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmRy5BpghvCjviPEDKUGJwU68AEozfUcYWdUqqQiDHQFwU';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) =  BattleUtils(battleUtils).getPosition(moveInput, player);

        // Distance requirement
        require(BattleUtils(battleUtils).distance(x, y, r_x, r_y) == 1);

        uint[176] memory tmp = moveInput;

        // Move
        tmp = BattleUtils(battleUtils).movePlayer(tmp, player, x, y);

        bool striked = true;
        uint8 strikedX = 0;
        uint8 strikedY = 0;

        // Eventually strike a player
        if (x > r_x && x < 7) {
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

        if (y > r_y && y < 7) {
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
            uint opponent = BattleUtils(battleUtils).getPlayer(moveInput, strikedX, strikedY);
            if (opponent > 0) {
                return BattleUtils(battleUtils).damage(tmp, opponent-1, 30);
            }
        }
        else {
            return tmp;
        }
    }
}
