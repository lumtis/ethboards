pragma solidity ^0.4.2;

import "./Nuja.sol";

contract WaterNuja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmR4zp6Bt6LTnAcFvBc1MuwL2xxQrk3ccFXGSxqgc7v6DD';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = BattleUtils(battleUtils).getPosition(moveInput, player);
        require(x == r_x && y == r_y);

        uint[176] memory tmp = moveInput;

        if(y > 0) {
            if(x > 0) {
                uint opponent = BattleUtils(battleUtils).getPlayer(tmp, x-1, y-1);
                if (opponent > 0) {
                    tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
                }
            }
            opponent = BattleUtils(battleUtils).getPlayer(tmp, x, y-1);
            if (opponent > 0) {
                tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
            }
            if(x < 7) {
                opponent = BattleUtils(battleUtils).getPlayer(tmp, x+1, y-1);
                if (opponent > 0) {
                    tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
                }
            }
        }

        if(x > 0) {
            opponent = BattleUtils(battleUtils).getPlayer(tmp, x-1, y);
            if (opponent > 0) {
                tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
            }
        }
        if(x < 7){
            opponent = BattleUtils(battleUtils).getPlayer(tmp, x+1, y);
            if (opponent > 0) {
                tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
            }
        }

        if(y < 7) {
            if(x > 0) {
                opponent = BattleUtils(battleUtils).getPlayer(tmp, x-1, y+1);
                if (opponent > 0) {
                    tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
                }
            }
            opponent = BattleUtils(battleUtils).getPlayer(tmp, x, y+1);
            if (opponent > 0) {
                tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
            }
            if(x < 7) {
                opponent = BattleUtils(battleUtils).getPlayer(tmp, x+1, y+1);
                if (opponent > 0) {
                    tmp = BattleUtils(battleUtils).damage(tmp, opponent-1, 10);
                }
            }
        }

        return tmp;
    }
}
