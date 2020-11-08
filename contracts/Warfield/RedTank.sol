pragma solidity 0.6.11;

import "./WarfieldPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract RedTank is Piece, WarfieldPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmefGNfRvPodVBfoSYVXfiQjDmij1ZWHL49BmNUUYnLatg';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 2;
    }

    function performMove(
        uint8 player,
        uint8 piece,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(!isOpponent(state, player, piece), "Player can't move a red piece");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions and distance
        (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);
        uint8 distance = distance(x,y,oldX,oldY);

        if (moveType == 0) {
            // Move
            require(distance > 0 && distance <= 2, "Can only move two box");

            int8 presentPiece = state.getPieceAt(x, y);
            if (presentPiece != -1) {
                require(isOpponent(state, player, uint8(presentPiece)), "Piece present");
                require(!isBase(state, uint8(presentPiece)), "Cannot move to a base");
                require(!isTank(state, uint8(presentPiece)), "Cannot move to a tank");
                outState = state.removePiece(uint8(presentPiece));
                outState = outState.movePiece(piece, x, y);
            } else {
                outState = state.movePiece(piece, x, y);
            }
        } else if (moveType == 1) {
            // Shoot
            require(distance == 1, "Can only shoot on the next box");
            int8 presentPiece = state.getPieceAt(x, y);
            require((presentPiece > -1) && isOpponent(state, player, uint8(presentPiece)), "No opponent");
            require(!isBase(state, uint8(presentPiece)), "Cannot shoot a base");
            outState = state.removePiece(uint8(presentPiece));
        } else {
            revert("Unknown move");
        }

        return outState;
    }
}