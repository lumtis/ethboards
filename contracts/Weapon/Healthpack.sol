pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Healthpack is Weapon {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);
        require(x == r_x && y == r_y);

        return restore(moveOutput, player, 60);
    }
}
