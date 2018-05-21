pragma solidity ^0.4.2;

import "./Nuja.sol";

contract WaterNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmdmJRrtkH5R6aR2KPTQe2gcA7q9SzsvSq4MTumRTbDZEX';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);
        require(x == r_x && y == r_y);

        uint[176] memory tmp = moveInput;

        if(y > 0) {
            if(x > 0) {
                uint opponent = getPlayer(tmp, x-1, y-1);
                if (opponent > 0) {
                    tmp = damage(tmp, opponent-1, 10);
                }
            }
            opponent = getPlayer(tmp, x, y-1);
            if (opponent > 0) {
                tmp = damage(tmp, opponent-1, 10);
            }
            if(x < 9) {
                opponent = getPlayer(tmp, x+1, y-1);
                if (opponent > 0) {
                    tmp = damage(tmp, opponent-1, 10);
                }
            }
        }

        if(x > 0) {
            opponent = getPlayer(tmp, x-1, y);
            if (opponent > 0) {
                tmp = damage(tmp, opponent-1, 10);
            }
        }
        if(x < 9){
            opponent = getPlayer(tmp, x+1, y);
            if (opponent > 0) {
                tmp = damage(tmp, opponent-1, 10);
            }
        }

        if(y < 9) {
            if(x > 0) {
                opponent = getPlayer(tmp, x-1, y+1);
                if (opponent > 0) {
                    tmp = damage(tmp, opponent-1, 10);
                }
            }
            opponent = getPlayer(tmp, x, y+1);
            if (opponent > 0) {
                tmp = damage(tmp, opponent-1, 10);
            }
            if(x < 9) {
                opponent = getPlayer(tmp, x+1, y+1);
                if (opponent > 0) {
                    tmp = damage(tmp, opponent-1, 10);
                }
            }
        }

        return tmp;
    }
}
