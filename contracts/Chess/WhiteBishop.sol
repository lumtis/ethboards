// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "./ChessPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract WhiteBishop is Piece, ChessPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmWJxS92Ktd5ypCaYtCbz5qfqMkjBUiFhzU5Cb5twt3i5L';
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

        // Must be a diagonal move
        require(
            abs(int8(x)-int8(oldX)) == abs(int8(y)-int8(oldY)),
            "Move not diagonal"
        );

        // Iteration to verify no piece on the road
        int8 i = int8(oldX);
        int8 j = int8(oldY);
        int8 incrementX;
        int8 incrementY;
        oldX < x ? incrementX = 1 : incrementX = -1;
        oldY < y ? incrementY = 1 : incrementY = -1;

        i += incrementX;
        j += incrementY;
        while (uint8(i)!=x) {
            require(state.noPieceAt(uint8(i), uint8(j)), "Piece on the road");
            i += incrementX;
            j += incrementY;
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
