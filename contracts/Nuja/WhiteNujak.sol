pragma solidity ^0.4.2;

import "./Nuja.sol";

contract WhiteNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmYXupJLMK2gSHbnKMinqyFYvrSymLcw1tWWR98ncXhyji';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {

    }
}
