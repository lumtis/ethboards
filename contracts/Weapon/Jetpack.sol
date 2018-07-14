pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Jetpack is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/Qmf26cKX5Wkw1LmG3vrT6A3FGTB4Hh6M5pXu8y48KDF58J';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        return movePlayer(moveInput, player, x, y);
    }
}
