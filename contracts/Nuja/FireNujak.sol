pragma solidity ^0.4.2;

import "./Nuja.sol";

contract FireNujak is Nuja {
    function getMetadata() public constant returns (string metadata) {
        return '/ipfs/QmW2dqjajrwEuN32sgAkhN5kWm53VR96NbZWzW98GkCy1p';
    }

    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput) {
        var (r_x, r_y) = getPosition(moveInput, player);

        // Distance requirement
        require(distance(x, y, r_x, r_y) == 1);

        // Strike
        uint building = getBuilding(moveInput, x, y);
        uint opponent = getPlayer(moveInput, x, y);
        require(building > 0);
        require(opponent > 0);
        return damage(moveInput, opponent-1, 40);
    }
}
