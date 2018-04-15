pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract FireNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmURVwyNPWG77VKphLfYVrLqiiyueN6c5Zyyo6ehkZnxYX';
    }

    function power(uint serverId, uint8 dir, uint8 x, uint8 y, uint8 player) public fromServer {

    }
}
