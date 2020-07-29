pragma solidity 0.6.11;

import "./WarfieldPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract RedSoldier is Pawn, WarfieldPawn {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmZbyT6qtJXaiNvovQCdBkfvczc2zz8j6pV5kcmo4FcM4T';
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
        require(!isOpponent(state, player, pawn), "Player can't move a red pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions and distance
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        uint8 distance = distance(x,y,oldX,oldY);

        if (moveType == 0) {
            // Move
            require(distance > 0 && distance <= 2, "Can only move two box");

            int8 presentPawn = state.getPawnAt(x, y);
            if (presentPawn != -1) {
                require(isOpponent(state, player, uint8(presentPawn)), "Pawn present");
                require(!isBase(state, uint8(presentPawn)), "Cannot move to a base");
                require(!isTank(state, uint8(presentPawn)), "Cannot move to a tank");
                outState = state.removePawn(uint8(presentPawn));
                outState = outState.movePawn(pawn, x, y);
            } else {
                outState = state.movePawn(pawn, x, y);
            }
        } else if (moveType == 1) {
            // Capture
            require(distance == 1, "Can only capture on the next box");
            int8 presentPawn = state.getPawnAt(x, y);
            require((presentPawn > -1) && isOpponent(state, player, uint8(presentPawn)), "No opponent");
            require(isBase(state, uint8(presentPawn)), "Can only capture a base");
            outState = state.transformPawn(uint8(presentPawn), 4);
        } else {
            revert("Unknown move");
        }

        return outState;
    }
}