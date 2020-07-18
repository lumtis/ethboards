pragma solidity 0.6.11;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract WhitePawn is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmaWxfYRrwRdoNnyn9zdGgcE7hDZZsm1c4nYkjsv4EXqtE';
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

        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);

        if (y < 8 && y == oldY + 1) {
            if (x == oldX) {
                // Normal move
                require(state.noPawnAt(x, y), "A pawn is already present");
                outState = state.movePawn(pawn, x, y);

            } else if (x < 8 && x == oldX + 1) {
                // Attack right
                int8 presentPawn = state.getPawnAt(x, y);
                require(presentPawn != -1, "No pawn present");
                require(isFoe(state, player, uint8(presentPawn)), "The pawn present is not a foe");
                outState = state.removePawn(uint8(presentPawn));
                outState = outState.movePawn(pawn, x, y);

            } else if (x >= 0 && x == oldX - 1) {
                // Attack left
                int8 presentPawn = state.getPawnAt(x, y);
                require(presentPawn != -1, "No pawn present");
                require(isFoe(state, player, uint8(presentPawn)), "The pawn present is not a foe");
                outState = state.removePawn(uint8(presentPawn));
                outState = outState.movePawn(pawn, x, y);

            } else {
                revert("Impossible move");
            }
        } else if (x == oldX && oldY == 1 && y == oldY + 2) {
            // Starting move
            require(state.noPawnAt(x, y), "A pawn is already present");
            require(state.noPawnAt(x, y-1), "A pawn is on the road");
            outState = state.movePawn(pawn, x, y);

        } else {
            revert("Impossible move");
        }

        return outState;
    }
}
