pragma solidity 0.6.11;

import "../Board.sol";
import "../StateController.sol";

contract WarfieldBoard is Board {
    using StateController for uint8[121];

    // This is no real chess, we check if the king has been killed to determine the victory
    function checkVictory(uint8 player, uint8[121] calldata state) external override view returns(bool) {
        if (player == 0) {
            // Player A win if all red bases are captured
            for (uint8 i = 0; i < 40; i++) {
                if (state.isAlive(i)) {
                    // Pawn 4 should be a red base
                    if (state.getPawnType(i) == 4) {
                        return false;
                    }
                }
            }
        } else {
            // Player B win if all blue bases are captured
             for (uint8 i = 0; i < 40; i++) {
                if (state.isAlive(i)) {
                    // Pawn 0 should be a blue base
                    if (state.getPawnType(i) == 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
}