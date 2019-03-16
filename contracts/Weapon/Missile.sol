pragma solidity ^0.4.2;

import "Weapon.sol";

contract Missile is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmRaJc9YGo4wyh2tPsKnWzLR4QhHKoxZprbh16HAexS2XG';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        // We must be in a building to shoot
        var (r_x, r_y) = getPosition(moveInput, player);
        require(distance(x, y, r_x, r_y) <= 5);

        require(getBuilding(moveInput, x, y) > 0);

        return setBuilding(moveInput, x, y, 0);
    }
}
