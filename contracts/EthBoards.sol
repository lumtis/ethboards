// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "./Board.sol";
import "./BoardHandler.sol";
import "./Piece.sol";
import "./StateController.sol";

/**
 * @title EthBoards
 * @notice The contract for the logical flow of games, simulate turns, check turns legitimacy and claim victory
*/
contract EthBoards {
    using StateController for uint8[121];

    uint constant timeoutTime = 5 minutes;

    struct Turn {
        uint8[4] move;
        bytes32 r;
        bytes32 s;
        uint8 v;
    }

    // Store the current turn with a started timeout for the specific game
    mapping (uint => mapping (uint => uint)) timeoutTurnNumber;

    // Store the timestamp of the timeout for the specific game
    mapping (uint => mapping (uint => uint)) timeoutTimestamp;

    // A player could start a timeout without sharing the turn he played
    // Therefore we save the last played turn (move and signature)
    // to ensure the second player can play and stop the timeout
    mapping (uint => mapping (uint => Turn)) timeoutTurn;


    // Simulate the turn from the board, user's move and input state
    /**
     * @notice Simulate the state transition when performing a move on the game
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param player that player that simulates the move (0 or 1)
     * @param move an array containing necessary information to perform the move [index of the selected piece, type of the move, x coordinate, y coordinate]
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

        // Get the address of the piece
        uint8 pieceType = state.getPieceType(move[0]);
        address pieceAddress = boardHandler.getBoardPieceContract(boardId, pieceType);
        Piece piece = Piece(pieceAddress);

        // Perform the move of the piece
        return piece.performMove(player, move[0], move[1], move[2], move[3], state);
    }

    /**
     * @notice Get from a turn signature (nonce, move, input state) the address of the signer, allow to verify if the player performing a move has correctly signed it
     * @param state the input state
     * @param nonce triplet that uniquely identifies the turn (board id, game id, turn number)
     * @param move an array containing necessary information to perform the move [index of the selected piece, type of the move, x coordinate, y coordinate]
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
      ) public pure returns (address) {

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
     * @notice Verify the two last turns and check if the current state of the game is legitimate
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @param turnNumber the number of the latest turn
     * @param move two arrays that contain the necessary information to perform the two last moves [index of the selected piece, type of the move, x coordinate, y coordinate]
     * @param r the two last r components of the signature
     * @param s the two last s components of the signature
     * @param v the two last v components of the signature
     * @param inputState the input state where we start checking the legitimacy of the state
     * @return currentState the legitimate state out of the turns
     * @return latestTurn the legitimate turn number
    */
    function checkTurnsLegitimacy(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint turnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) internal view returns (uint8[121] memory currentState, uint latestTurn) {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        // If we begin from the first turn therefore the input state is the initial state from the board
        if (turnNumber <= 2) {
            currentState = boardHandler.getInitialState(boardId);

            if (turnNumber == 0) {
                // The turn number == 0, no legitimacy to verify since no turn
                return (currentState, 0);
            }
        } else {
            currentState = inputState;
        }

        // The nonce is a triplet containing: [boardId, gameId, turn]
        latestTurn = (turnNumber == 1 ? 0 : turnNumber-2);
        uint[3] memory nonce;
        nonce[0] = boardId;
        nonce[1] = gameId;
        nonce[2] = latestTurn;

        // Check each turn has been signed by the correct player
        // And retrieve the final state
        for (uint8 i = 0; i < (turnNumber == 1 ? 1 : 2); i++) {
            require(getTurnSignatureAddress(
                    currentState,
                    nonce,
                    move[i],
                    r[i],
                    s[i],
                    v[i]
                ) == boardHandler.getGamePlayerAddress(boardId, gameId, latestTurn), "The signature of the turn is incorrect"
            );

            // Simulate the player turn
            currentState = simulate(
                boardHandlerAddress,
                boardId,
                uint8(latestTurn % 2),  // Even turn -> player A/0, odd turn -> player B/1
                move[i],
                currentState
            );

            // Increment the turn number for the second turn
            nonce[2] += 1;
            latestTurn += 1;
        }

        // We decrement latestTurn to get the number of latest played turn
        return (currentState, latestTurn-1);
    }

    /**
     * @notice Allow a player to claim victory if the state of the game is victorious for the player, if it's the case, the finishGame of the board handler contract is called
     * @dev To check if the state is victorious, we give the two last turns to ensure the state is legitime (signed by the two players)
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @param turnNumber the number of the latest turn
     * @param move two arrays that contain the necessary information to perform the two last moves [index of the selected piece, type of the move, x coordinate, y coordinate]
     * @param r the two last r components of the signature
     * @param s the two last s components of the signature
     * @param v the two last v components of the signature
     * @param inputState the input state where we start checking the legitimacy of the victorious state
    */
    function claimVictory(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint turnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) public {
        uint8[121] memory currentState;
        uint latestTurn;

        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            turnNumber,
            move,
            r,
            s,
            v,
            inputState
        );

        // Check if the final state is victoreious
        Board board = Board(boardHandler.getBoardContractAddress(boardId));
        require(board.checkVictory(uint8(latestTurn%2), currentState), "The player hasn't won the game");

        // If the player won, terminate the game
        boardHandler.finishGame(boardId, gameId, uint8(latestTurn%2));
    }

    /**
     * @notice Start a timeout, once started the opponent has to call the stop timeout function within 5 minutes
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @param turnNumber the number of the latest turn
     * @param move two arrays that contain the necessary information to perform the two last moves [index of the selected piece, type of the move, x coordinate, y coordinate]
     * @param r the two last r components of the signature
     * @param s the two last s components of the signature
     * @param v the two last v components of the signature
     * @param inputState the input state where we start checking the legitimacy of the victorious state
    */
    function startTimeout(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint turnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) public {
        uint8[121] memory currentState;
        uint latestTurn;

        // Verify there is no pending timeout
        require(timeoutTimestamp[boardId][gameId] == 0, "There is already a pending timeout");

        // Verify there is no upper timeout turn
        require(turnNumber >= timeoutTurnNumber[boardId][gameId], "A upper timeout turn already exist");

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            turnNumber,
            move,
            r,
            s,
            v,
            inputState
        );

        // Set the timeout
        timeoutTurnNumber[boardId][gameId] = turnNumber;
        timeoutTimestamp[boardId][gameId] = block.timestamp + timeoutTime;

        // Store the last played turn to ensure it is shared to the players
        timeoutTurn[boardId][gameId].move = move[1];
        timeoutTurn[boardId][gameId].r = r[1];
        timeoutTurn[boardId][gameId].s = s[1];
        timeoutTurn[boardId][gameId].v = v[1];
    }

    /**
     * @notice Stop a started timeout
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @param turnNumber the number of the latest turn
     * @param move two arrays that contain the necessary information to perform the two last moves [index of the selected piece, type of the move, x coordinate, y coordinate]
     * @param r the two last r components of the signature
     * @param s the two last s components of the signature
     * @param v the two last v components of the signature
     * @param inputState the input state where we start checking the legitimacy of the victorious state
    */
    function stopTimeout(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint turnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) public {
        uint8[121] memory currentState;
        uint latestTurn;

        // Check there is a pending timeout
        require(timeoutTimestamp[boardId][gameId] > 0, "There is no pending timeout");

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            turnNumber,
            move,
            r,
            s,
            v,
            inputState
        );

        // Verify that the turn is above the timeout turn
        require(turnNumber > timeoutTurnNumber[boardId][gameId], "This turn is not above the timeout turn");

        // Cancel timeout and update timeoutTurnNumber
        timeoutTimestamp[boardId][gameId] = 0;
        timeoutTurnNumber[boardId][gameId] = turnNumber;
    }

    /**
     * @notice Stop a started timeout
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
    */
    function executeTimeout(
        address boardHandlerAddress,
        uint boardId,
        uint gameId
    ) public {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        // Check there is a pending timeout
        require(timeoutTimestamp[boardId][gameId] > 0, "There is no pending timeout");

        // Check the timeout time has been reached
        require(block.timestamp > timeoutTimestamp[boardId][gameId], "The timeout is not reached yet");

        // FInish the game with the latest player who played the turn as the winner
        boardHandler.finishGame(boardId, gameId, uint8((timeoutTurnNumber[boardId][gameId]+1)%2));
    }

    /**
     * @notice Get the information about timeout for a game
     * @param boardHandlerAddress the address of the Board Handler contract
     * @param boardId the id of the board
     * @param gameId the id of the game
     * @return isPending true if a timeout is pending
     * @return timestamp the timestamp when the timeout can be executed
     * @return turnNumber the number of the latest turn before the timeout
     * @return move the last turn played
     * @return r the r component of the signature of the last turn
     * @return s the s component of the signature of the last turn
     * @return v the v component of the signature of the last turn
    */
    function getTimeoutInfo(
        address boardHandlerAddress,
        uint boardId,
        uint gameId
    ) public view returns (
        bool isPending,
        uint timestamp,
        uint turnNumber,
        uint8[4] memory move,
        bytes32 r,
        bytes32 s,
        uint8 v
    ) {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        // Check if a timestamp is pending
        if (timeoutTimestamp[boardId][gameId] == 0) {
            return (false, 0, 0, [0,0,0,0], "", "", 0);
        }

        Turn memory latestTurn = timeoutTurn[boardId][gameId];

        return (
            true,
            timeoutTimestamp[boardId][gameId],
            timeoutTurnNumber[boardId][gameId],
            latestTurn.move,
            latestTurn.r,
            latestTurn.s,
            latestTurn.v
        );
    }
}