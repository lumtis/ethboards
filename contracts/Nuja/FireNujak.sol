pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract FireNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmURVwyNPWG77VKphLfYVrLqiiyueN6c5Zyyo6ehkZnxYX';
    }

    function power(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d == 1);

        // Strike
        var (rr_f, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        require(rr_f > 0);
        require(rr_p > 0);
        nujaContract.damage(serverId, rr_p-1, 50);
    }
}
