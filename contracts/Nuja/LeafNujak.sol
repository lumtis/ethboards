pragma solidity ^0.4.2;

import "./Nuja.sol";

contract LeafNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmWKBXqLef8ADhzdY1UmCcHyNPCsdb9w6LsWXgzBajJS1C';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        // Strike
        uint opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);

        uint[176] memory tmp = damage(moveInput, opponent-1, 20);
        return restore(tmp, player, 10);
    }
}
