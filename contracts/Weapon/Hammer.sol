pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Hammer is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmWD6upeuBZJe3aDkbpyoUxxpppkgNpn4RzS8FZbj7xWXs';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);

        // Distance requirement
        uint d = distance(x, y, r_x, r_y);
        require(d == 1);

        // Strike
        var (rr1, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        require(rr_p > 0);
        nujaContract.damage(serverId, rr_p-1, 50);
    }
}
