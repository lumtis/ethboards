pragma solidity ^0.4.2;

import "./Nuja.sol";

contract WhiteNuja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmYXupJLMK2gSHbnKMinqyFYvrSymLcw1tWWR98ncXhyji';
    }

    function power(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {

    }
}
