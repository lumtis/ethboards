pragma solidity ^0.4.2;

import "./Nuja.sol";

contract LeafNuja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmYzq4dHKY5JAEH97ABjTJui8aVUsQmzWg525YCzDovHrY';
    }

    function power(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        // Strike
        uint8 opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);

        uint8[176] memory tmp = damage(moveInput, opponent-1, 20);
        return restore(tmp, player, 10);
    }
}
