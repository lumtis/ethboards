pragma solidity 0.5.16;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract WhiteBishop is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external view returns (string memory etadata) {
        return '/ipfs/QmPtTLyaaMYzLrxKP13VNd7NAr3Fubktj29FP22JdxhxKi';
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
        require(!isFoe(state, player, pawn), "Player can't move a white pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        require(x!=oldX || y!=oldY, "Must be a different position");

        // Must be a diagonal move
        require(
            abs(int8(x)-int8(oldX)) == abs(int8(y)-int8(oldY)),
            "Move not diagonal"
        );

        // Iteration to verify no pawn on the road
        int8 i = int8(oldX);
        int8 j = int8(oldY);
        int8 incrementX;
        int8 incrementY;
        oldX < x ? incrementX = 1 : incrementX = -1;
        oldY < y ? incrementY = 1 : incrementY = -1;

        i += incrementX;
        j += incrementY;
        while (uint8(i)!=x) {
            require(state.noPawnAt(uint8(i), uint8(j)), "Pawn on the road");
            i += incrementX;
            j += incrementY;
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
