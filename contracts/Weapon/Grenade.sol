pragma solidity ^0.4.2;

import "Weapon.sol";

contract Grenade is Weapon {


    function getMetadata() public pure returns (string metadata) {
        return '/ipfs/QmWUHrPsJNB7wZNPHZKos4B1jqUMdwgvhDPf2ZPrrkuGof';
    }

    function use(uint8 x, uint8 y, uint8 player, uint8[176] moveInput) public view returns(uint8[176] moveOutput) {
        require(x > 0 && x < 7 && y > 0 && y < 7);

        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        uint8 d = distance(x, y, r_x, r_y);
        require(d > 0 && d < 4);

        moveOutput = moveInput;

        uint8 opponent = getPlayer(moveOutput, x-1, y-1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x, y-1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x+1, y-1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x-1, y);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x, y);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 50); // Center player takes more damage
        }
        opponent = getPlayer(moveOutput, x+1, y);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x-1, y+1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x, y+1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }
        opponent = getPlayer(moveOutput, x+1, y+1);
        if (opponent > 0) {
            moveOutput = damage(moveOutput, opponent-1, 30);
        }

        return moveOutput;
    }
}
