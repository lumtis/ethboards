pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Jetpack is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmaucMB5ZRNSNGYoPJaPhETD2LGMuDLzyWagE3NrotALvg';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        return movePlayer(moveInput, player, x, y);
    }
}
