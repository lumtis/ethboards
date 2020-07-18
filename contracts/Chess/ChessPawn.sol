pragma solidity 0.6.11;

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
        uint8[121] memory state,
        uint8 player,
        uint8 pawn
    ) internal pure returns(bool) {
        uint8 pawnType = state.getPawnType(pawn);

        if (player == 0) {
            if (pawnType > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            if (pawnType < 6) {
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