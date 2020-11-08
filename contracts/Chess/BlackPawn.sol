// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "./ChessPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract BlackPawn is Piece, ChessPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/Qmd56iiABueZKgFoKJAidfh6ag83d6o42FYuopngP6VPJr';
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
        require(!isFoe(state, player, piece), "Player can't move a black piece");

        (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);

        if (y >= 0 && y == oldY - 1) {
            if (x == oldX) {
                // Normal move
                require(state.noPieceAt(x, y), "A piece is already present");
                outState = state.movePiece(piece, x, y);

            } else if (x < 8 && x == oldX + 1) {
                // Attack right
                int8 presentPiece = state.getPieceAt(x, y);
                require(presentPiece != -1, "No piece present");
                require(isFoe(state, player, uint8(presentPiece)), "The piece present is not a foe");
                outState = state.removePiece(uint8(presentPiece));
                outState = outState.movePiece(piece, x, y);

            } else if (x >= 0 && x == oldX - 1) {
                // Attack left
                int8 presentPiece = state.getPieceAt(x, y);
                require(presentPiece != -1, "No piece present");
                require(isFoe(state, player, uint8(presentPiece)), "The piece present is not a foe");
                outState = state.removePiece(uint8(presentPiece));
                outState = outState.movePiece(piece, x, y);

            } else {
                revert("Impossible move");
            }
        } else if (x == oldX && oldY == 6 && y == oldY - 2) {
            // Starting move
            require(state.noPieceAt(x, y), "A piece is already present");
            require(state.noPieceAt(x, y+1), "A piece is on the road");
            outState = state.movePiece(piece, x, y);

        } else {
            revert("Impossible move");
        }

        return outState;
    }
}
