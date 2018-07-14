pragma solidity ^0.4.2;

import "./Nuja.sol";

contract FireNuja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmW2dqjajrwEuN32sgAkhN5kWm53VR96NbZWzW98GkCy1p';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = BattleUtils(battleUtils).getPosition(moveInput, player);

        // Distance requirement
        require(BattleUtils(battleUtils).distance(x, y, r_x, r_y) == 1);

        // Strike
        uint building = BattleUtils(battleUtils).getBuilding(moveInput, x, y);
        uint opponent = BattleUtils(battleUtils).getPlayer(moveInput, x, y);
        require(building > 0);
        require(opponent > 0);
        return BattleUtils(battleUtils).damage(moveInput, opponent-1, 40);
    }
}
