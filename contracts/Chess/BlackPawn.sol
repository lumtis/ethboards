pragma solidity 0.5.12;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract BlackPawn is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external view returns (string metadata) {
        return '/ipfs/QmZL1sZTGc4yFjioseKfRnqwXS8GihTqvu7vojbeHaaZBN';
    }
    function getMoveNumber() external view returns(uint8) {
        return 1;
    }

    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] state
    ) external view returns(uint8[121]) {
        require(!isFoe(player, pawn), "Player can't move a black pawn");

        uint8[121] memory outState;
        uint8 (oldX, oldY) = state.getPawnPosition(pawn);

        if (y >= 0 && y == oldY - 1) {
            if (x == oldX) {
                // Normal move
                require(state.noPawnAt(x, y), "A pawn is already present");
                outState = state.movePawn(pawn, x, y);

            } else if (x < 8 && x == oldX + 1) {
                // Attack right
                presentPawn = state.getPawnAt(x, y);
                require(presentPawn != -1, "No pawn present");
                require(isFoe(player, uint8(presentPawn)), "The pawn present is not a foe");
                outState = state.removePawn(presentPawn);
                outState = state.movePawn(pawn, x, y);

            } else if (x >= 0 && x == oldX - 1) {
                // Attack left
                presentPawn = state.getPawnAt(x, y);
                require(presentPawn != -1, "No pawn present");
                require(isFoe(player, uint8(presentPawn)), "The pawn present is not a foe");
                outState = state.removePawn(presentPawn);
                outState = state.movePawn(pawn, x, y);

            } else {
                revert("Impossible move");
            }
        } else if (x == oldX && y == 6 && y == oldY - 2) {
            // Starting move
            require(state.noPawnAt(x, y), "A pawn is already present");
            require(state.noPawnAt(x, y+1), "A pawn is on the road");
            outState = state.movePawn(pawn, x, y);

        } else {
            revert("Impossible move");
        }

        return outState;
    }
}
