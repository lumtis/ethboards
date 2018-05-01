pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract Bearjak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmUVnyX6JS2izsMsYJNfUbJkpRshkmFC4x3yzYx8WE9D6M';
    }

    function power(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
