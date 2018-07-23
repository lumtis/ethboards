pragma solidity ^0.4.2;

import "./Nuja.sol";

contract PinkNuja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmZiem1UUpJJUQkn9GhYyewh2AFNdTufoMapfctR4dR9rP';
    }

    function power(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {

    }
}
