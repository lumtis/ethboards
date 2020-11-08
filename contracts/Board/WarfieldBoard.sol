// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "../Board.sol";
import "../StateController.sol";

contract WarfieldBoard is Board {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmNUEGVxp4frM9oGmSXQD3jZiWyoBrnZ8YAy58he7ZKwSy';
    }

    function checkVictory(uint8 player, uint8[121] calldata state) external override view returns(bool) {
        if (player == 0) {
            // Player A win if the red headquarter is captured
            if (state.isAlive(1) && state.getPieceType(1) == 9) {
                return false;
            }
        } else {
            // Player B win if the blue headquarter is captured
            if (state.isAlive(0) && state.getPieceType(0) == 4) {
                return false;
            }
        }

        return true;
    }
}