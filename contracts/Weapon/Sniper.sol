pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Sniper is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmdPavz3brQLWyuNd97v8anNtggm95CBn63K5GA57RkpiK';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        // We must be in a building to shoot
        var (r_x, r_y) = getPosition(moveInput, player);
        require(distance(x, y, r_x, r_y) > 2);
        require(getBuilding(moveInput, r_x, r_y) > 0);

        // The ennemy must be on plain field
        require(getBuilding(moveInput, x, y) == 0);

        // Strike
        uint8 opponent = getPlayer(moveInput, x, y);

        require(opponent > 0);
        return damage(moveInput, opponent-1, 60);
    }
}
