pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Pistol is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmU9Bojt2H2THdkWN7uwF4yyzxQKq8vjMZb5qA8x1oTHYE';
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
