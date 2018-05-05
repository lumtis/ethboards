pragma solidity ^0.4.2;

import "./Weapon.sol";
import "../NujaBattle.sol";

contract Sniper is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmYfE1RJVpGWBcHjDdnpcgRRRLAeYFqrSH1pGfC3wvqXer';
    }

    function use(uint serverId, uint8 x, uint8 y, uint8 player) public fromServer {
        NujaBattle nujaContract = NujaBattle(SERVERREGISTRY);

        // We must be in a building to shoot
        var (r_x, r_y) = nujaContract.playerPosition(serverId, player);
        var (rr_f, rr_p) = nujaContract.fieldInformation(serverId, r_x, r_y);
        require(rr_f > 0);

        // The ennemy must be on plain field
        (rr_f, rr_p) = nujaContract.fieldInformation(serverId, x, y);
        require(rr_f == 0);
        require(rr_p > 0);
        nujaContract.damage(serverId, rr_p-1, 80);
    }
}
