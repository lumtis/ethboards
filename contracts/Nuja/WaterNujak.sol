pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract WaterNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmZvuRW7is3uu5kvpHaSrGaqHgsLvadGbP92K93o7XzQy9';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
