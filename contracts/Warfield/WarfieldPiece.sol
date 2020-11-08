pragma solidity 0.6.11;

import "../StateController.sol";

// Contains utilitary function for warfield piece
// Player A controls white pieces, piece from 0 to 4
// Player B controls white pieces, piece from 5 to 9
contract WarfieldPiece {
    using StateController for uint8[121];

    function isOpponent(
        uint8[121] memory state,
        uint8 player,
        uint8 piece
    ) internal pure returns(bool) {
        uint8 pieceType = state.getPieceType(piece);

        if (player == 0) {
            if (pieceType > 4) {
                return true;
            } else {
                return false;
            }
        } else {
            if (pieceType < 5) {
                return true;
            } else {
                return false;
            }
        }
    }

    function isSoldierOrBazooka(
        uint8[121] memory state,
        uint8 piece
    ) internal pure returns(bool) {
        uint8 pieceType = state.getPieceType(piece);

        return (pieceType == 1 || pieceType == 2 || pieceType == 6 || pieceType == 7);
    }

    function isTank(
        uint8[121] memory state,
        uint8 piece
    ) internal pure returns(bool) {
        uint8 pieceType = state.getPieceType(piece);

        return (pieceType == 3 || pieceType == 8);
    }

    function isBase(
        uint8[121] memory state,
        uint8 piece
    ) internal pure returns(bool) {
        uint8 pieceType = state.getPieceType(piece);

        return (pieceType == 0 || pieceType == 4 || pieceType == 5 || pieceType == 9);
    }

    function abs(int8 a) internal pure returns (uint8) {
        return a < 0 ? (uint8)(-a) : (uint8)(a);
    }

    function distance(uint8 x1, uint8 y1, uint8 x2, uint8 y2) internal pure returns (uint8) {
        return abs((int8)(x1-x2)) + abs((int8)(y1-y2));
    }
}