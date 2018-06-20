pragma solidity ^0.4.2;

import "./Nuja.sol";

contract Bearjak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmUVnyX6JS2izsMsYJNfUbJkpRshkmFC4x3yzYx8WE9D6M';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        require(x == r_x && y == r_y);

        uint[176] memory tmp = moveInput;

        for(uint8 i=0; i<8; i++) {
            tmp = damage(tmp, i, 5);
        }
        return tmp;
    }
}
