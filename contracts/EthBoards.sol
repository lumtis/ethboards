pragma solidity 0.5.16;

import "./Board.sol";
import "./BoardHandler.sol";
import "./Pawn.sol";
import "./StateController.sol";

contract EthBoards {
    using StateController for uint8[121];

    /**
     * @notice Simulate the state transition when performing a move on the game
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param player that player that simulates the move (0 or 1)
     * @param move an array containing necessary information to perform the move [index of the selected pawn, type of the move, x coordinate, y coordinate]
     * @param state the state of the game
     * @return the new state once the move has been performed, reverted if the move is not possible
    */
    function simulate(
        address boardHandlerAddress,
        uint boardId,
        uint8 player,
        uint8[4] memory move,
        uint8[121] memory state
    ) public view returns (uint8[121] memory) {
        require(player < 2, "Player must be player A or player B");

        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Get the address of the pawn
        uint8 pawnType = state.getPawnType(move[0]);
        address pawnAddress = boardHandler.getBoardPawnTypeContract(boardId, pawnType);
        Pawn pawn = Pawn(pawnAddress);

        // Perform the move of the pawn
        return pawn.performMove(player, move[0], move[1], move[2], move[3], state);
    }

    /**
     * @notice Get from a turn signature (nonce, move, input state) the address of the signer, allow to verify if the player performing a move has correctly signed it
     * @param state the input state
     * @param nonce triplet that uniquely identifies the turn (board id, game id, turn number)
     * @param move an array containing necessary information to perform the move [index of the selected pawn, type of the move, x coordinate, y coordinate]
     * @param r the r component of the signature
     * @param s the s component of the signature
     * @param v the v component of the signature
     * @return the address of the signer
    */
    function getTurnSignatureAddress(
      uint8[121] memory state,
      uint[3] memory nonce,
      uint8[4] memory move,
      bytes32 r,
      bytes32 s,
      uint8 v
      ) public pure returns (address recovered) {

        // Convert to uint for keccak256 function
        uint[121] memory inStateUint;
        for(uint8 i = 0; i < 121; i++) {
          inStateUint[i] = uint(state[i]);
        }
        uint[4] memory moveUint;
        for(uint8 i = 0; i < 4; i++) {
          moveUint[i] = uint(move[i]);
        }

        // Calculate the hash of the move
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 message = keccak256(abi.encodePacked(prefix, keccak256(abi.encodePacked(nonce, moveUint, inStateUint))));

        return ecrecover(message, v, r, s);
    }

    /**
     * @notice Allow a player to claim victory if the state of the game is victorious for the player, if it's the case, the finishGame of the board handler contract is called
     * @dev To check if the state is victorious, we give the two last turns to ensure the state is legitime (signed by the two players)
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @param the number of the initial turn (currentTurn -2) where we start checking if the victorious state is legitime (two preceding turns have been signed)
     * @param move two arrays that contain the necessary information to perform the two last moves [index of the selected pawn, type of the move, x coordinate, y coordinate]
     * @param r the two last r components of the signature
     * @param s the two last s components of the signature
     * @param v the two last v components of the signature
     * @param state the input state where we start checking the legitimacy of the victorious state
    */
    function claimVictory(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint initialTurnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) public {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        uint8[121] memory currentState;

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
            require(getTurnSignatureAddress(
                    currentState,
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
                uint8(turnNumber % 2),  // Even turn -> player A/0, odd turn -> player B/1
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
        require(board.checkVictory(uint8(turnNumber%2), currentState), "The player hasn't won the game");

        // If the player won, terminate the game
        boardHandler.finishGame(boardId, gameId, uint8(turnNumber%2));
    }
}
