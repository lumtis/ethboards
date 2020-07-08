pragma solidity 0.5.16;

import "./Board.sol";
import "./BoardHandler.sol";
import "./Pawn.sol";
import "./StateController.sol";

contract EthBoards {
    using StateController for uint8[121];

    uint constant timeoutTime = 5 minutes;

    struct Turn {
        uint8[4] move;
        bytes32 r,
        bytes32 s,
        uint8 v
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

    // Get from a turn set (nonce, move, input state) the address of the signer
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

    // Verify the two last turns and check if the current state of the game is legitimate
    function checkTurnsLegitimacy(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
        uint initialTurnNumber,
        uint8[4][2] memory move,
        bytes32[2] memory r,
        bytes32[2] memory s,
        uint8[2] memory v,
        uint8[121] memory inputState
    ) internal returns (uint8[121] memory currentState, uint latestTurn) {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        // If we begin from the first turn therefore the input state is the initial state from the board
        if (initialTurnNumber == 0) {
            currentState = boardHandler.getInitialState(boardId);
        } else {
            currentState = inputState;
        }

        // The nonce is a triplet containing: [boardId, gameId, turn]
        latestTurn = initialTurnNumber;
        uint[3] memory nonce;
        nonce[0] = boardId;
        nonce[1] = gameId;
        nonce[2] = latestTurn;

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
            nonce[2] += 1;
            latestTurn += 1;
        }

        // We decrement latestTurn to get the number of latest played turn
        return (currentState, latestTurn-1);
    }

    // Test the victory of the board and call the terminate the game if victory
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
        uint8[121] currentState;
        uint latestTurn;

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            initialTurnNumber,
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

    // Start a timeout
    function startTimeout(
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
        uint8[121] currentState;
        uint latestTurn;

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            initialTurnNumber,
            move,
            r,
            s,
            v,
            inputState
        );

        // Verify there is no upper timeout turn
        require(latestTurn > timeoutTurnNumber[boardId][gameId], "A upper timeout turn already exist");

        // Set the timeout
        timeoutTurnNumber[boardId][gameId] = latestTurn;
        timeoutTimestamp[boardId][gameId] = block.timestamp;

        // Store the last played turn to ensure it is shared to the players
        timeoutTurn[boardId][gameId].move = move[1];
        timeoutTurn[boardId][gameId].r = r[1];
        timeoutTurn[boardId][gameId].s = s[1];
        timeoutTurn[boardId][gameId].v = v[1];
    }

    // Stop the timeout
    function stopTimeout(
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
        uint8[121] currentState;
        uint latestTurn;

        // Check the legitimacy of the latest turn
        (currentState, latestTurn) = checkTurnsLegitimacy(
            boardHandlerAddress,
            boardId,
            gameId,
            initialTurnNumber,
            move,
            r,
            s,
            v,
            inputState
        );

        // Verify that the turn is above the timeout turn
        require(latestTurn > timeoutTurnNumber[boardId][gameId], "This turn is not above the timeout turn");

        // Cancel timeout
        timeoutTimestamp[boardId][gameId] = 0;
    }

    // Execute the timeout and kick the afk player
    function executeTimeout(
        address boardHandlerAddress,
        uint boardId,
        uint gameId,
    ) {
        // Get the board
        BoardHandler boardHandler = BoardHandler(boardHandlerAddress);
        require(boardId < boardHandler.getBoardNumber(), "The board doesn't exist");

        // Check the game exist and is not finished
        require(!boardHandler.isGameOver(boardId, gameId), "The game is already over");

        // Check there is a pending timeout
        require(timeoutTimestamp[boardId][gameId] > 0, "There is no pending timeout");

        // Check the timeout time has been reached
        require(block.timestamp > timeoutTimestamp[boardId][gameId] + timeoutTime, "The timeout is not reached yet");

        // FInish the game with the latest player who played the turn as the winner
        boardHandler.finishGame(boardId, gameId, uint8(timeoutTurnNumber[boardId][gameId]%2));
    }
}
