pragma solidity 0.6.11;

import "../Board.sol";
import "../StateController.sol";

contract WarfieldBoard is Board {
    using StateController for uint8[121];
    function checkVictory(uint8 player, uint8[121] calldata state) external override view returns(bool) {
        if (player == 0) {
            // Player A win if the red headquarter is captured
            if (state.isAlive(1) && state.getPawnType(1) == 9) {
                return false;
            }
        } else {
            // Player B win if the blue headquarter is captured
            if (state.isAlive(0) && state.getPawnType(0) == 8) {
                return false;
            }
        }

        return true;
    }
}