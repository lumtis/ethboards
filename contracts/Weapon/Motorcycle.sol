pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Motorcycle is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmZ62SBEeVcFFdR5DZREzTFYoAuhH5VsZQudBfHY1qni18';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);
        require(distance(x, y, r_x, r_y) <=3);
        return movePlayer(moveInput, player, x, y);
    }
}
