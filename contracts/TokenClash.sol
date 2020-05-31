pragma solidity 0.5.12;

import "./Board.sol";
import "./BoardHandler.sol";
import "./Pawn.sol";
import "./StateController.sol";

contract TokenClash {
    using StateController for uint8[121];

    //////////////////////////////////////////////////////////////////
    // Turn simulation

    // Simulate the output state from the board, user's move and input state
    function simulate(
        address boardHandlerAddress,
        uint boardId,
        uint8 player,
        uint8[4] move,
        uint8[121] state
    ) public view returns (uint8[121]) {
        require(player < 2, "Player must be player A or player B");

        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber, "The board doesn't exist");

        // Get the address of the pawn
        uint8 pawnType = state.getPawnType(move[0]);
        address pawnAddress = boardHandler.getBoardPawnTypeContract(boardId, pawnType);
        Pawn pawn = Pawn(pawnAddress);

        // Perform the move of the pawn
        return pawn.performMove(player, move[0], move[1], move[2], move[3], state);
    }

    //////////////////////////////////////////////////////////////////
    // Match functions

    // Test the victory of the board and call the terminate the game if victory
    function claimVictory(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint initialTurnNumber,
        uint[4][2] move,
        bytes32[2] r,
        bytes32[2] s,
        uint8[2] v,
        uint8[121] inputState
    ) public {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber, "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        uint8[176] memory currentState;

        // If we begin from the first turn therefore the input state is the initial state from the board
        if (initialTurnNumber == 0) {
            currentState = boardHandler.getInitialState(boardId);
        } else {
            currentState = inputState;
        }

        // The nonce is a triplet containing: [boardId, gameId, turn]
        uint turnNumber = initialTurnNumber;
        uint[3] memory nonce;
        nonce[0] = boardId;
        nonce[1] = gameId;
        nonce[2] = turnNumber;

        // Check each turn has been signed by the correct player
        // And retrieve the final state
        for (uint8 i = 0; i < 2; i++) {
            require(currentState.turnOwner(
                    nonce,
                    move[i],
                    r[i],
                    s[i],
                    v[i]
                ) == boardHandler.getGamePlayerAddress(boardId, gameId, turnNumber), "The signature of the turn is incorrect"
            );

            // Simulate the player turn
            currentState = simulate(
                boardHandlerAddress,
                boardId,
                turnNumber % 2,  // Even turn -> player A/0, odd turn -> player B/1
                move[i],
                currentState
            );

            // Increment the turn number for the second turn
            nonce[2] += 1;  // TODO: Use SafeMath
            turnNumber += 1;
        }
        turnNumber -= 1;

        // Check if the final state is victoreious
        Board board = Board(boardHandler.getBoardContractAddress(boardId));
        require(board.checkVictory(turnNumber%2, currentState), "The player hasn't won the game");

        // If the player won, terminate the game
        boardHandler.finishGame(boardId, gameId, turnNumber%2);
    }
}
