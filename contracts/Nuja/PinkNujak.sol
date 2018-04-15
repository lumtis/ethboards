pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract PinkNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmZiem1UUpJJUQkn9GhYyewh2AFNdTufoMapfctR4dR9rP';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
