pragma solidity ^0.4.2;

import "Weapon.sol";

contract Hammer is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmRdeneeFAc8oxQKBAUcJwyPFzagsUn5CAukKSVNWoqkJn';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        // Strike
        uint8 opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);
        return damage(moveInput, opponent-1, 60);
    }
}
