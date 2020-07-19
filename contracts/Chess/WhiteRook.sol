pragma solidity 0.6.11;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract WhiteRook is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmRC2S7k5tW2jmNahUjSiA5YJC6Gem7RBUkz2wJJPto7Y2';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 1;
    }

    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(moveType == 0, "Pawn contains only one move");
        require(!isFoe(state, player, pawn), "Player can't move a white pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        require(x!=oldX || y!=oldY, "Must be a different position");

        // Iteration to verify no pawn on the road
        // Iterate differently based on the direction
        if (x==oldX) {
            // Iteration when vertical direction
            int8 i = int8(oldY);
            int8 incrementY;
            oldY < y ? incrementY = 1 : incrementY = -1;
            i += incrementY;
            while (uint8(i)!=y) {
                require(state.noPawnAt(x, uint8(i)), "Pawn on the road");
                i += incrementY;
            }
        } else if (y==oldY) {
            // Iteration when horizontal direction
            int8 i = int8(oldX);
            int8 incrementX;
            oldX < x ? incrementX = 1 : incrementX = -1;
            i += incrementX;
            while (uint8(i)!=x) {
                require(state.noPawnAt(uint8(i), y), "Pawn on the road");
                i += incrementX;
            }
        } else {
            // Must be a straight move
            revert("Move not straight");
        }

        // If a foe is present in the destination, kill it
        int8 presentPawn = state.getPawnAt(x, y);
        if (presentPawn != -1) {
            require(isFoe(state, player, uint8(presentPawn)), "The pawn present is not a foe");
            outState = state.removePawn(uint8(presentPawn));
            outState = outState.movePawn(pawn, x, y);
        } else {
            outState = state.movePawn(pawn, x, y);
        }

        return outState;
    }
}
