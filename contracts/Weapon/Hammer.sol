pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Hammer is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmWD6upeuBZJe3aDkbpyoUxxpppkgNpn4RzS8FZbj7xWXs';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        // Strike
        uint opponent = getPlayer(tmp, x, y);
        require(opponent > 0);
        return damage(moveInput, opponent-1, 50);
    }
}
