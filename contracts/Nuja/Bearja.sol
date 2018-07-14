pragma solidity ^0.4.2;

import "./Nuja.sol";

contract Bearja is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmZL1sZTGc4yFjioseKfRnqwXS8GihTqvu7vojbeHaaZBN';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = BattleUtils(battleUtils).getPosition(moveInput, player);

        require(x == r_x && y == r_y);

        uint[176] memory tmp = moveInput;

        for(uint8 i=0; i<8; i++) {
            tmp = BattleUtils(battleUtils).damage(tmp, i, 5);
        }
        return tmp;
    }
}
