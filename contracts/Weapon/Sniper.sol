pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Sniper is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmdPavz3brQLWyuNd97v8anNtggm95CBn63K5GA57RkpiK';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        // We must be in a building to shoot
        var (r_x, r_y) = BattleUtils(battleUtils).getPosition(moveInput, player);
        require(BattleUtils(battleUtils).distance(x, y, r_x, r_y) > 2);
        require(BattleUtils(battleUtils).getBuilding(moveInput, r_x, r_y) > 0);

        // The ennemy must be on plain field
        require(BattleUtils(battleUtils).getBuilding(moveInput, x, y) == 0);

        // Strike
        uint opponent = BattleUtils(battleUtils).getPlayer(moveInput, x, y);

        require(opponent > 0);
        return BattleUtils(battleUtils).damage(moveInput, opponent-1, 80);
    }
}
