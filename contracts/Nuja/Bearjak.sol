pragma solidity ^0.4.2;

import "./Nuja.sol";
import "../NujaBattle.sol";

contract Bearjak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmUVnyX6JS2izsMsYJNfUbJkpRshkmFC4x3yzYx8WE9D6M';
    }

    function power(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        require(x == r_x && y == r_y);

        uint8 nbPlayer = nujaContract.getPlayerNb(serverId);
        for(uint8 i = 0; i<nbPlayer; i++) {
            nujaContract.damage(serverId, i, 5);
        }
    }
}
