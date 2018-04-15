pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract Bulljak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmY2Pt34b3xvSjDJ8nP91Yd6CVv9YugUDsY5Hv91JCHjBX';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
