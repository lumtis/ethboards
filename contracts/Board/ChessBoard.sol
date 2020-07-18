pragma solidity 0.6.11;

import "../Board.sol";
import "../StateController.sol";

contract ChessBoard is Board {
    using StateController for uint8[121];

    // This is no real chess, we check if the king has been killed to determine the victory
    function checkVictory(uint8 player, uint8[121] calldata state) external override view returns(bool) {
        if (player == 0) {
            // The player is A therefore the black king must be kill
            return !state.isAlive(1);
        } else {
            // White king must be killed
            return !state.isAlive(0);
        }
    }
}