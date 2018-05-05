pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Jetpack is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmaucMB5ZRNSNGYoPJaPhETD2LGMuDLzyWagE3NrotALvg';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        nujaContract.movePlayer(serverId, player, x, y);
    }
}
