pragma solidity 0.6.11;

import "./WarfieldPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract RedHeadquarters is Pawn, WarfieldPawn {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmWbYuGvcbZr2hvTU1fqcugCGT5F8U1aQmimcZxqNRfT4G';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 2;
    }

    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(!isOpponent(state, player, pawn), "Impossible move");
        if (moveType < 2) {
            // Recruit

            (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
            uint8 distance = distance(x,y,oldX,oldY);
            require(distance == 1, "Can only recruit on the next box");

            // Check no pawn is around
            if (oldX > 0) {
                require(state.noPawnAt(oldX-1, oldY), "Can only recruit if no pawn around");
            }
            if (oldY > 0) {
                require(state.noPawnAt(oldX, oldY-1), "Can only recruit if no pawn around");
            }
            if (oldX < 7) {
                require(state.noPawnAt(oldX+1, oldY), "Can only recruit if no pawn around");
            }
            if (oldY < 7) {
                require(state.noPawnAt(oldX, oldY+1), "Can only recruit if no pawn around");
            }

            // Search for an empty slot in the game state to create a new pawn
            for(uint8 i = 0; i < 40; i++) {
                if(!state.isAlive(i)) {
                    if (moveType == 0) {
                        // Recruit soldier
                        return state.respawnPawn(i, 5, x, y);
                    } else {
                        // Recruit bazooka
                        return state.respawnPawn(i, 6, x, y);
                    }
                }
            }
            revert("Cannot create a new pawn");
        } else {
            revert("Unknown move");
        }
    }
}