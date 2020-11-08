pragma solidity 0.6.11;

import "./WarfieldPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract BlueBazooka is Piece, WarfieldPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmPNLmxe5cdJsrbATYd96cmSR3HJd3jjeqvqW8Xcuz4pjn';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 3;
    }

    function performMove(
        uint8 player,
        uint8 piece,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(!isOpponent(state, player, piece), "Player can't move a blue piece");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions and distance
        (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);
        uint8 distance = distance(x,y,oldX,oldY);

        if (moveType == 0) {
            // Move
            require(distance == 1, "Can only move to the next box");
            require(state.noPieceAt(x,y), "A piece is already present");
            outState = state.movePiece(piece, x, y);
        } else if (moveType == 1) {
            // Shoot
            require(distance == 1, "Can only shoot on the next box");
            int8 presentPiece = state.getPieceAt(x, y);
            require((presentPiece > -1) && isOpponent(state, player, uint8(presentPiece)), "No opponent");
            require(!isBase(state, uint8(presentPiece)), "Cannot shoot a base");
            outState = state.removePiece(uint8(presentPiece));
        } else if (moveType == 2) {
            // Capture
            require(distance == 1, "Can only capture on the next box");
            int8 presentPiece = state.getPieceAt(x, y);
            require((presentPiece > -1) && isOpponent(state, player, uint8(presentPiece)), "No opponent");
            require(isBase(state, uint8(presentPiece)), "Can only capture a base");
            outState = state.transformPiece(uint8(presentPiece), 0);
        } else {
            revert("Unknown move");
        }

        return outState;
    }
}