pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract LeafNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmWKBXqLef8ADhzdY1UmCcHyNPCsdb9w6LsWXgzBajJS1C';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
