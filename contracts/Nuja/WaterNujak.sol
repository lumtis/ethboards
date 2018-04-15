pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract WaterNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmdmJRrtkH5R6aR2KPTQe2gcA7q9SzsvSq4MTumRTbDZEX';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
