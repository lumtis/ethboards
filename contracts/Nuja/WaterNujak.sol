pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract WaterNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmdmJRrtkH5R6aR2KPTQe2gcA7q9SzsvSq4MTumRTbDZEX';
    }

    function power(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        require(x == r_x && y == r_y);

        if(y > 0) {
            if(x > 0) {
                var (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y-1);
                if (rr_p > 0) {
                    nujaContract.damage(serverId, rr_p-1, 10);
                }
            }
            (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y-1);
            if (rr_p > 0) {
                nujaContract.damage(serverId, rr_p-1, 10);
            }
            if(x < 9) {
                (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y-1);
                if (rr_p > 0) {
                    nujaContract.damage(serverId, rr_p-1, 10);
                }
            }
        }

        if(x > 0) {
            (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y);
            if (rr_p > 0) {
                nujaContract.damage(serverId, rr_p-1, 10);
            }
        }
        if(x < 9){
            (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y);
            if (rr_p > 0) {
                nujaContract.damage(serverId, rr_p-1, 10);
            }
        }

        if(y < 9) {
            if(x > 0) {
                (rr1, rr_p) = nujaContract.fieldInformation(serverId, x-1, y+1);
                if (rr_p > 0) {
                    nujaContract.damage(serverId, rr_p-1, 10);
                }
            }
            (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y+1);
            if (rr_p > 0) {
                nujaContract.damage(serverId, rr_p-1, 10);
            }
            if(x < 9) {
                (rr1, rr_p) = nujaContract.fieldInformation(serverId, x+1, y+1);
                if (rr_p > 0) {
                    nujaContract.damage(serverId, rr_p-1, 10);
                }
            }
        }
    }
}
