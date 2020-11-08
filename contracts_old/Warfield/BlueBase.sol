pragma solidity 0.6.11;

import "./WarfieldPiece.sol";
import "../Piece.sol";
import "../StateController.sol";

contract BlueBase is Piece, WarfieldPiece {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmQJaFWePch5tML9rM2EYVnSp5WDGk5ay6y16BvsZBa9nm';
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
        require(!isOpponent(state, player, piece), "Impossible move");
        if (moveType < 2) {
            // Recruit

            (uint8 oldX, uint8 oldY) = state.getPiecePosition(piece);
            uint8 distance = distance(x,y,oldX,oldY);
            require(distance == 1, "Can only recruit on the next box");

            // Check no piece is around
            if (oldX > 0) {
                require(state.noPieceAt(oldX-1, oldY), "Can only recruit if no piece around");
            }
            if (oldY > 0) {
                require(state.noPieceAt(oldX, oldY-1), "Can only recruit if no piece around");
            }
            if (oldX < 7) {
                require(state.noPieceAt(oldX+1, oldY), "Can only recruit if no piece around");
            }
            if (oldY < 7) {
                require(state.noPieceAt(oldX, oldY+1), "Can only recruit if no piece around");
            }

            // Search for an empty slot in the game state to create a new piece
            for(uint8 i = 0; i < 40; i++) {
                if(!state.isAlive(i)) {
                    if (moveType == 0) {
                        // Recruit soldier
                        return state.respawnPiece(i, 1, x, y);
                    } else {
                        // Recruit bazooka
                        return state.respawnPiece(i, 2, x, y);
                    }
                }
            }
            revert("Cannot create a new piece");
        } else {
            revert("Unknown move");
        }
    }
}