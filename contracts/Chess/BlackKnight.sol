pragma solidity 0.5.16;

import "./ChessPawn.sol";
import "../Pawn.sol";
import "../StateController.sol";

contract BlackKnight is Pawn, ChessPawn {
    using StateController for uint8[121];

    function getMetadata() external view returns (string memory metadata) {
        return '/ipfs/QmdEV46GsHAWW6LxcrLFwVfXBw71q1Pw7xDFYpNqsukFQf';
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
        require(!isFoe(player, pawn), "Player can't move a black pawn");
        require(x<8 || y<8, "Move out of bound");

        // Get old positions
        (uint8 oldX, uint8 oldY) = state.getPawnPosition(pawn);
        
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