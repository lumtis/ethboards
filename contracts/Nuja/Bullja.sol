pragma solidity ^0.4.2;

import "./Nuja.sol";

contract Bullja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmWjzSvtyBvR5ZXGW9sKPSiSA44vQuoG6Sx1uELqJG9192';
    }

    function power(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        var (r_x, r_y) =  getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        uint8[176] memory tmp = moveInput;

        // Move
        tmp = movePlayer(tmp, player, x, y);

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
            uint8 opponent = getPlayer(moveInput, strikedX, strikedY);
            if (opponent > 0) {
                return damage(tmp, opponent-1, 30);
            }
        }
        else {
            return tmp;
        }
    }
}
