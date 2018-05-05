pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract LeafNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmWKBXqLef8ADhzdY1UmCcHyNPCsdb9w6LsWXgzBajJS1C';
    }

    function power(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d == 1);

        // Strike
        var (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        require(rr_p > 0);
        nujaContract.damage(serverId, rr_p-1, 20);
        nujaContract.restore(serverId, player, 10);
    }
}
