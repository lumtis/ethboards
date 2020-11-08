// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "../StateController.sol";

// Contains utilitary function for chess piece
// Player A controls white pieces, piece from 0 to 5
// Player B controls white pieces, piece from 6 to 11
// 0: King
// 1: Queen
// 2: Bishop
// 3: Knight
// 4: Rook
// 5: Pawn
contract ChessPiece {
    using StateController for uint8[121];

    function isFoe(
        uint8[121] memory state,
        uint8 player,
        uint8 piece
    ) internal pure returns(bool) {
        uint8 pieceType = state.getPieceType(piece);

        if (player == 0) {
            if (pieceType > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            if (pieceType < 6) {
                return true;
            } else {
                return false;
            }
        }
    }

    function abs(int8 a) internal pure returns (uint8) {
        return a < 0 ? (uint8)(-a) : (uint8)(a);
    }
}