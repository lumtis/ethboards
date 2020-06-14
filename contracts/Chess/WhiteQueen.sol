pragma solidity 0.5.16;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract WhiteQueen is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external view returns (string memory etadata) {
        return '/ipfs/QmZDGiNuY9ZVnCU6tZmCqjJ9Bawt3btSPKSiWyfskqJwdy';
    }
    function getMoveNumber() external pure returns(uint8) {
        return 1;
    }

    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external pure returns(uint8[121] memory outState) {
        require(moveType == 0, "Pawn contains only one move");
        require(!isFoe(player, pawn), "Player can't move a white pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        require(x!=oldX || y!=oldY, "Must be a different position");

        // Iteration to verify no pawn on the road
        int8 i;
        int8 j;
        int8 incrementX;
        int8 incrementY;
        if (abs(int8(x)-int8(oldX)) == abs(int8(y)-int8(oldY))) {
            // Iteration when diagonal direction
            i = int8(oldX);
            j = int8(oldY);
            oldX < x ? incrementX = 1 : incrementX = -1;
            oldY < y ? incrementY = 1 : incrementY = -1;

            i += incrementX;
            j += incrementY;
            while (uint8(i)!=x) {
                require(state.noPawnAt(uint8(i), uint8(j)), "Pawn on the road");
                i += incrementX;
                j += incrementY;
            }
        } else if (x==oldX) {
            // Iteration when vertical direction
            i = int8(oldY);
            oldY < y ? incrementY = 1 : incrementY = -1;
            while (uint8(i)!=y) {
                require(state.noPawnAt(x, uint8(i)), "Pawn on the road");
                i += incrementY;
            }
        } else if (y==oldY) {
            // Iteration when horizontal direction
            i = int8(oldX);
            oldX < x ? incrementX = 1 : incrementX = -1;
            while (uint8(i)!=x) {
                require(state.noPawnAt(uint8(i), y), "Pawn on the road");
                i += incrementX;
            }
        } else {
            // Must be a straight move
            revert("Move neither diagonal nor straight");
        }

        // If a foe is present in the destination, kill it
        int8 presentPawn = state.getPawnAt(x, y);
        if (presentPawn != -1) {
            require(isFoe(player, uint8(presentPawn)), "The pawn present is not a foe");
            outState = state.removePawn(uint8(presentPawn));
            outState = outState.movePawn(pawn, x, y);
        } else {
            outState = state.movePawn(pawn, x, y);
        }

        return outState;
    }
}
