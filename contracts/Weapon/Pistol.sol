pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Pistol is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmPHfBcmbSm9VDTKX5MCzrX4zQCyePaWrnWpGR5B7s5P9L';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d > 0 && d < 4);

        // Strike
        uint opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);
        return damage(moveInput, opponent-1, 20);
    }
}
