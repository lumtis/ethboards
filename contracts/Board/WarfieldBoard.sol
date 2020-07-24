pragma solidity 0.6.11;

import "../Board.sol";
import "../StateController.sol";

contract WarfieldBoard is Board {
    using StateController for uint8[121];

    // This is no real chess, we check if the king has been killed to determine the victory
    function checkVictory(uint8 player, uint8[121] calldata state) external override view returns(bool) {
        return false;
    }
}