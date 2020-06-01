pragma solidity 0.5.16;

import "../StateController.sol";

// Contains utilitary function for chess pawn
// Player A controls white pawns, pawn from 0 to 5
// Player A controls white pawns, pawn from 6 to 11
// 0: King
// 1: Queen
// 2: Bishop
// 3: Knight
// 4: Rook
// 5: Pawn
contract ChessPawn {
    using StateController for uint8[121];

    function isFoe(
        uint8 player,
        uint8 pawn
    ) internal pure returns(bool) {
        if (player == 0) {
            if (pawn > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            if (pawn < 6) {
                return true;
            } else {
                return false;
            }
        }
    }
}