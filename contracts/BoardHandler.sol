// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "./PieceSet.sol";
import "./BoardEvents.sol";

/**
 * @title Board Handler
 * @notice The storage contract, store the informations about boards and games
*/
contract BoardHandler {

    ///////////////////////////////////////////////////////////////
    /// Events

    /**
    * Emitted when a new board is created
    * @param creator The creator of the board
    * @param boardId The id of the board
    * @param name Name of the board
    */
    event BoardCreated(
        address indexed creator,
        uint indexed boardId,
        string name
    );

    /**
    * Emitted when a new game is started
    * @param playerA The player A of the game
    * @param playerB The player B of the game
    * @param boardId The id of the board
    * @param gameId The id of the game
    */
    event GameStarted(
        address indexed playerA,
        address indexed playerB,
        uint indexed boardId,
        uint gameId
    );

    /**
    * Emitted when a new game is finished
    * @param playerA The player A of the game
    * @param playerB The player B of the game
    * @param winner The winner of the game
    * @param boardId The id of the board
    * @param gameId The id of the game
    */
    event GameFinished(
        address indexed playerA,
        address indexed playerB,
        address winner,
        uint boardId,
        uint gameId
    );

    ///////////////////////////////////////////////////////////////
    /// Structures

    struct PiecePosition {
        uint8 pieceIndex;
        uint8 x;
        uint8 y;
    }

    struct Game {
        address playerA;
        address playerB;
        bool over;
    }

    struct Board {
        uint id;
        string name;
        address boardContract;
        address pieceSet;
        address boardEvents;
        uint8 pieceNumber;
        mapping (uint8 => PiecePosition) piecePosition;
        uint gameCount;
        mapping (uint => Game) games;
        address waitingPlayer;
    }

    uint boardNumber;
    Board[] boards;
    address ethBoards;

    ///////////////////////////////////////////////////////////////

    constructor(address ethBoardsAddress) public {
        boardNumber = 0;
        ethBoards = ethBoardsAddress;
    }

    ///////////////////////////////////////////////////////////////
    /// Board administration

    /**
     * @notice Create a new board
     * @param name name of the board
     * @param boardContract address of the smart contract that represents the board
     * @param pieceSetAddress the address of the set of pieces to use for the board
     * @param x array that represents the x coordinates where to add the pieces
     * @param y array that represents the y coordinates where to add the pieces
     * @param pieceIndex array that represents the piece index from the set of the pieces to add
     * @param pieceNb number of piece to add
    */
    function createBoard(
        string memory name,
        address boardContract,
        address pieceSetAddress,
        address boardEventsAddress,
        uint8[40] memory x,
        uint8[40] memory y,
        uint8[40] memory pieceIndex,
        uint8 pieceNb
    ) public {
        require(pieceNb <= 40 && pieceNb > 0, "You can place maximum 40 pieces on the board");

        // Create the board
        Board memory newBoard;
        newBoard.id = boardNumber;
        newBoard.boardContract = boardContract;
        newBoard.pieceSet = pieceSetAddress;
        newBoard.boardEvents = boardEventsAddress;
        newBoard.pieceNumber = pieceNb;
        newBoard.gameCount = 0;
        newBoard.waitingPlayer = address(0);
        boards.push(newBoard);

        // Get the piece set to verify piece indexes are correct
        PieceSet pieceSet = PieceSet(pieceSetAddress);
        uint8 pieceSetPieceNb = pieceSet.getPieceNb();

        // Place pieces
        for (uint8 i = 0; i < pieceNb; i++) {
            require(x[i] < 8 && y[i] < 8, "The piece position is out of bound");
            require(pieceIndex[i] < pieceSetPieceNb, "The piece doesn't exist");

            PiecePosition memory newPiece;
            newPiece.pieceIndex = pieceIndex[i];
            newPiece.x = x[i];
            newPiece.y = y[i];

            boards[boardNumber].piecePosition[i] = newPiece;
        }

        emit BoardCreated(msg.sender, boardNumber, name);
        boardNumber += 1;
    }

    ///////////////////////////////////////////////////////////////
    /// Game

    /**
     * @notice Join a new game on a board. When a player joins a game, he's in the waiting room for the game, if someone is present in the waiting room, the game is started against this player
     * @param boardId id of the board
    */
    function joinGame(uint boardId) public {
        require(boardId < boardNumber, "The board doesn't exist");

        // Get the board events contract to verify join conditions
        BoardEvents boardEvents = BoardEvents(boards[boardId].boardEvents);
        require(boardEvents.joinGame(boardId, boards[boardId].gameCount, msg.sender), "The player can't join the game");

        // If there is no waiting player yet
        if (boards[boardId].waitingPlayer == address(0)) {
            boards[boardId].waitingPlayer = msg.sender;
        } else {
            // Start a new game
            Game memory newGame;
            newGame.playerA = boards[boardId].waitingPlayer;
            newGame.playerB = msg.sender;
            newGame.over = false;

            // Register the game
            boards[boardId].games[boards[boardId].gameCount] = newGame;
            emit GameStarted(newGame.playerA, newGame.playerB, boardId, boards[boardId].gameCount);

            // Reset waiting room
            boards[boardId].waitingPlayer = address(0);

            // Increment total number of game
            boards[boardId].gameCount += 1;
        }
    }

    /**
     * @notice Finish a game, internal
     * @param boardId id of the board
     * @param gameId id of the game
     * @param winner player that won the game (0 or 1)
    */
    function _finishGame(uint boardId, uint gameId, uint8 winner) internal {
        require(boardId < boardNumber, "The board doesn't exist");
        require(gameId < boards[boardId].gameCount, "The game doesn't exist");
        require(!boards[boardId].games[gameId].over, "The game is already over");
        require(winner < 2, "The winner doesn't exist");

        address winnerAddress;
        address loserAddress;
        if (winner == 0) {
            winnerAddress = boards[boardId].games[gameId].playerA;
            loserAddress = boards[boardId].games[gameId].playerB;
        } else {
            winnerAddress = boards[boardId].games[gameId].playerB;
            loserAddress = boards[boardId].games[gameId].playerA;
        }

        emit GameFinished(
            boards[boardId].games[gameId].playerA,
            boards[boardId].games[gameId].playerB,
            winnerAddress,
            boardId,
            gameId
        );
        boards[boardId].games[gameId].over = true;

        // Call the event finished of the board
        BoardEvents boardEvents = BoardEvents(boards[boardId].boardEvents);
        boardEvents.gameFinished(boardId, gameId, winnerAddress, loserAddress);
    }

    /**
     * @notice Finish a game, this function can only be called by the ethBoards contract, this contract ensure the winner is legit
     * @param boardId id of the board
     * @param gameId id of the game
     * @param winner player that won the game (0 or 1)
    */
    function finishGame(uint boardId, uint gameId, uint8 winner) public {
        require(msg.sender == ethBoards, "The function must be called by the ethboards contract");
        _finishGame(boardId, gameId, winner);
    }

    /**
     * @notice Give up a game, can be called anytime by one of the player of the game
     * @param boardId id of the board
     * @param gameId id of the game
    */
    function giveUp(uint boardId, uint gameId) public {
        require(boardId < boardNumber, "The board doesn't exist");
        require(gameId < boards[boardId].gameCount, "The game doesn't exist");

        if (msg.sender == boards[boardId].games[gameId].playerA) {
            // The player A gave up, player B wins
            _finishGame(boardId, gameId, 1);
        } else if (msg.sender == boards[boardId].games[gameId].playerB) {
            // The player B gave up, player A wins
            _finishGame(boardId, gameId, 0);
        } else {
            revert("Only a player of the game can give up");
        }
    }

    ///////////////////////////////////////////////////////////////
    /// Board information

    /**
     * @notice Get the number of boards
     * @return number of boards
    */
    function getBoardNumber() public view returns(uint) {
        return boardNumber;
    }

    /**
     * @notice Get the address of the smart contract of the board
     * @param boardId id of the board
     * @return address of the smart contract of the board
    */
    function getBoardContractAddress(uint boardId) public view returns(address) {
        require(boardId < boardNumber, "The board doesn't exist");
        return boards[boardId].boardContract;
    }

    /**
     * @notice Get the number of pieces placed on a board
     * @param boardId id of the board
     * @return number of pieces placed on a board
    */
    function getBoardPieceNumber(uint boardId) public view returns(uint8) {
        require(boardId < boardNumber, "The board doesn't exist");

        return boards[boardId].pieceNumber;
    }

    /**
     * @notice Get piece smart contract of a specific piece in the piece set of the board
     * @param boardId id of the board
     * @param pieceIndex index of the piece in the piece set
     * @return address of the piece smart contract
    */
    function getBoardPieceContract(uint boardId, uint8 pieceIndex) public view returns(address) {
        require(boardId < boardNumber, "The board doesn't exist");

        // Get the piece set
        PieceSet pieceSet = PieceSet(boards[boardId].pieceSet);

        return pieceSet.getPiece(pieceIndex);
    }

    /**
     * @notice Get the initial state of a board
     * @param boardId id of the board
     * @return state the initial state of the board
    */
    function getInitialState(uint boardId) public view returns(uint8[121] memory state) {
        require(boardId < boardNumber, "The board doesn't exist");

        // Piece number
        state[0] = boards[boardId].pieceNumber;

        for(uint8 i = 0; i<boards[boardId].pieceNumber; i++) {
             // Piece type
            state[1+i] = boards[boardId].piecePosition[i].pieceIndex+1;
            // Piece x position
            state[41+i] = boards[boardId].piecePosition[i].x;
            // Piece y position
            state[81+i] = boards[boardId].piecePosition[i].y;
        }

        return state;
    }

    ///////////////////////////////////////////////////////////////
    /// Game information

    /**
     * @notice Get the number of game occurences of a board
     * @param boardId id of the board
     * @return the number of game occurences of the board
    */
    function getGameNumber(uint boardId) public view returns(uint) {
        require(boardId < boardNumber, "The board doesn't exist");
        return boards[boardId].gameCount;
    }

    /**
     * @notice Check if a player is currently waiting to play a game on a board
     * @param boardId id of the board
     * @return isWaiting true if a player is currently waiting
     * @return waitingPlayer address of this player
    */
    function isWaitingPlayer(uint boardId) public view returns(bool isWaiting, address waitingPlayer) {
        require(boardId < boardNumber, "The board doesn't exist");

        isWaiting = true;
        if (boards[boardId].waitingPlayer == address(0)) {
            isWaiting = false;
        }
        return (isWaiting, boards[boardId].waitingPlayer);
    }

    /**
     * @notice Check if a specifc game of a board is finished
     * @param boardId id of the board
     * @param gameId id of the game
     * @return true if the game has been finished, revert if the game doesn't exist
    */
    function isGameOver(uint boardId, uint gameId) public view returns(bool) {
        require(boardId < boardNumber, "The board doesn't exist");
        require(gameId < boards[boardId].gameCount, "The game doesn't exist");

        return boards[boardId].games[gameId].over;
    }

    /**
     * @notice Get the address of a player in the game
     * @param boardId id of the board
     * @param gameId id of the game
     * @param turnNumber the number of the current turn in the game, even number means player A, odd number means player B
     * @return addres of the player
    */
    function getGamePlayerAddress(uint boardId, uint gameId, uint turnNumber) public view returns(address) {
        require(boardId < boardNumber, "The board doesn't exist");
        require(gameId < boards[boardId].gameCount, "The game doesn't exist");

        address playerAddress;

        // Every even turn are played by player A while every odd turn are played by player B
        if (turnNumber % 2 == 0) {
            playerAddress = boards[boardId].games[gameId].playerA;
        } else {
            playerAddress = boards[boardId].games[gameId].playerB;
        }

        return playerAddress;
    }

    /**
     * @notice Check from the player address, if it's player A or B
     * @param boardId id of the board
     * @param gameId id of the game
     * @param playerAddress address of the player
     * @return 0 if it's player A, 1 if it's player B, -1 if this address is not part of the game
    */
    function getGamePlayerIndex(uint boardId, uint gameId, address playerAddress) public view returns(int) {
        require(boardId < boardNumber, "The board doesn't exist");
        require(gameId < boards[boardId].gameCount, "The game doesn't exist");

        if (playerAddress == boards[boardId].games[gameId].playerA) {
            return 0;
        } else if (playerAddress == boards[boardId].games[gameId].playerB) {
            return 1;
        }

        return -1;
    }
}
