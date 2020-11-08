// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "./ChessPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract BlackKnight is Piece, ChessPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmPWgaKBeex5DwEmwYWGDMyE3gJyAjYzuedqjGT1Buztog';
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
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);

        // Check all possible position
        require(
            (x==oldX+1 && y==oldY+2) ||
            (x==oldX+1 && y==oldY-2) ||
            (x==oldX-1 && y==oldY+2) ||
            (x==oldX-1 && y==oldY-2) ||
            (x==oldX+2 && y==oldY+1) ||
            (x==oldX+2 && y==oldY-1) ||
            (x==oldX-2 && y==oldY+1) ||
            (x==oldX-2 && y==oldY-1),
            "Impossible move"
        );

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