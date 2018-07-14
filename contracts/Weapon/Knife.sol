pragma solidity ^0.4.2;

import "./Weapon.sol";

contract Knife is Weapon {

    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmZ98DHoD97jdDX8qSh4nN51CxzaEiZwGHsxTsRVWrYbM5';
    }

    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = BattleUtils(battleUtils).getPosition(moveInput, player);

        // Distance requirement
        require(BattleUtils(battleUtils).distance(x, y, r_x, r_y) == 1);

        // Strike
        uint opponent = BattleUtils(battleUtils).getPlayer(moveInput, x, y);
        require(opponent > 0);
        return BattleUtils(battleUtils).damage(moveInput, opponent-1, 30);
    }
}
