pragma solidity 0.6.11;

import "./ChessPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract WhiteRook is Piece, ChessPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmQrQR5aR6Dmf9SBZAxQE6r8zYpHxctNBUz1XAKc3kasou';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 1;
    }

    function performMove(
        uint8 player,
        uint8 piece,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(moveType == 0, "Piece contains only one move");
        require(!isFoe(state, player, piece), "Player can't move a white piece");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);
        require(x!=oldX || y!=oldY, "Must be a different position");

        // Iteration to verify no piece on the road
        // Iterate differently based on the direction
        if (x==oldX) {
            // Iteration when vertical direction
            int8 i = int8(oldY);
            int8 incrementY;
            oldY < y ? incrementY = 1 : incrementY = -1;
            i += incrementY;
            while (uint8(i)!=y) {
                require(state.noPieceAt(x, uint8(i)), "Piece on the road");
                i += incrementY;
            }
        } else if (y==oldY) {
            // Iteration when horizontal direction
            int8 i = int8(oldX);
            int8 incrementX;
            oldX < x ? incrementX = 1 : incrementX = -1;
            i += incrementX;
            while (uint8(i)!=x) {
                require(state.noPieceAt(uint8(i), y), "Piece on the road");
                i += incrementX;
            }
        } else {
            // Must be a straight move
            revert("Move not straight");
        }

        // If a foe is present in the destination, kill it
        int8 presentPiece = state.getPieceAt(x, y);
        if (presentPiece != -1) {
            require(isFoe(state, player, uint8(presentPiece)), "The piece present is not a foe");
            outState = state.removePiece(uint8(presentPiece));
            outState = outState.movePiece(piece, x, y);
        } else {
            outState = state.movePiece(piece, x, y);
        }

        return outState;
    }
}
