pragma solidity ^0.4.2;

import "./Weapon.sol";

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

        uint8[176] memory tmp = moveInput;

        uint8 opponent = getPlayer(tmp, x-1, y-1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x, y-1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x+1, y-1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x-1, y);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x, y);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 50); // Center player takes more damage
        }
        opponent = getPlayer(tmp, x+1, y);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x-1, y+1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x, y+1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }
        opponent = getPlayer(tmp, x+1, y+1);
        if (opponent > 0) {
            tmp = damage(tmp, opponent-1, 30);
        }

        return tmp;
    }
}
