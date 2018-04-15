pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract WhiteNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmYXupJLMK2gSHbnKMinqyFYvrSymLcw1tWWR98ncXhyji';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
