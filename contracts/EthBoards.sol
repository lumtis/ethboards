pragma solidity 0.5.16;

import "./Board.sol";
import "./BoardHandler.sol";
import "./Pawn.sol";
import "./StateController.sol";

contract EthBoards {
    using StateController for uint8[121];

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
