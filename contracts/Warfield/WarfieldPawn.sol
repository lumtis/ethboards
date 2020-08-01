pragma solidity 0.6.11;

import "../StateController.sol";

// Contains utilitary function for warfield pawn
// Player A controls white pawns, pawn from 0 to 4
// Player B controls white pawns, pawn from 5 to 9
contract WarfieldPawn {
    using StateController for uint8[121];

    function isOpponent(
        uint8[121] memory state,
        uint8 player,
        uint8 pawn
    ) internal pure returns(bool) {
        uint8 pawnType = state.getPawnType(pawn);

        if (player == 0) {
            if (pawnType > 4) {
                return true;
            } else {
                return false;
            }
        } else {
            if (pawnType < 5) {
                return true;
            } else {
                return false;
            }
        }
    }

    function isSoldierOrBazooka(
        uint8[121] memory state,
        uint8 pawn
    ) internal pure returns(bool) {
        uint8 pawnType = state.getPawnType(pawn);

        return (pawnType == 1 || pawnType == 2 || pawnType == 6 || pawnType == 7);
    }

    function isTank(
        uint8[121] memory state,
        uint8 pawn
    ) internal pure returns(bool) {
        uint8 pawnType = state.getPawnType(pawn);

        return (pawnType == 3 || pawnType == 8);
    }

    function isBase(
        uint8[121] memory state,
        uint8 pawn
    ) internal pure returns(bool) {
        uint8 pawnType = state.getPawnType(pawn);

        return (pawnType == 0 || pawnType == 4 || pawnType == 5 || pawnType == 9);
    }

    function abs(int8 a) internal pure returns (uint8) {
        return a < 0 ? (uint8)(-a) : (uint8)(a);
    }

    function distance(uint8 x1, uint8 y1, uint8 x2, uint8 y2) internal pure returns (uint8) {
        return abs((int8)(x1-x2)) + abs((int8)(y1-y2));
    }
}