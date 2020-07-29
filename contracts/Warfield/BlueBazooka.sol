pragma solidity 0.6.11;

import "./WarfieldPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract BlueBazooka is Pawn, WarfieldPawn {
    using StateController for uint8[121];

    function getMetadata() external override view returns (string memory) {
        return '/ipfs/QmPNLmxe5cdJsrbATYd96cmSR3HJd3jjeqvqW8Xcuz4pjn';
    }
    function getMoveNumber() external override pure returns(uint8) {
        return 3;
    }

    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external override pure returns(uint8[121] memory outState) {
        require(!isOpponent(state, player, pawn), "Player can't move a blue pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions and distance
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        uint8 distance = distance(x,y,oldX,oldY);

        if (moveType == 0) {
            // Move
            require(distance == 1, "Can only move to the next box");
            require(state.noPawnAt(x,y), "A pawn is already present");
            outState = state.movePawn(pawn, x, y);
        } else if (moveType == 1) {
            // Shoot
            require(distance == 1, "Can only shoot on the next box");
            int8 presentPawn = state.getPawnAt(x, y);
            require((presentPawn > -1) && isOpponent(state, player, uint8(presentPawn)), "No opponent");
            require(!isBase(state, uint8(presentPawn)), "Cannot shoot a base");
            outState = state.removePawn(uint8(presentPawn));
        } else if (moveType == 2) {
            // Capture
            require(distance == 1, "Can only capture on the next box");
            int8 presentPawn = state.getPawnAt(x, y);
            require((presentPawn > -1) && isOpponent(state, player, uint8(presentPawn)), "No opponent");
            require(isBase(state, uint8(presentPawn)), "Can only capture a base");
            outState = state.transformPawn(uint8(presentPawn), 0);
        } else {
            revert("Unknown move");
        }

        return outState;
    }
}