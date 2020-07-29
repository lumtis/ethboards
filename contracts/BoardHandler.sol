pragma solidity 0.6.11;

import "./PawnSet.sol";
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

    struct PawnPosition {
        uint8 pawnIndex;
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
        address pawnSet;
        address boardEvents;
        uint8 pawnNumber;
        mapping (uint8 => PawnPosition) pawnPosition;
        uint gameCount;
        mapping (uint => Game) games;
        address waitingPlayer;
    }

    uint boardNumber;
    Board[] boards;
    address ethBoards;

    ///////////////////////////////////////////////////////////////

    modifier fromEthBoards {
        require(msg.sender == ethBoards, "The function must be called by the ethboards contract");
        _;
    }

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
     * @param pawnSetAddress the address of the set of pawn to use for the board
     * @param x array that represents the x coordinates where to add the pawns
     * @param y array that represents the y coordinates where to add the pawns
     * @param pawnIndex array that represents the pawn index from the set of the pawns to add
     * @param pawnNb number of pawn to add
    */
    function createBoard(
        string memory name,
        address boardContract,
        address pawnSetAddress,
        address boardEventsAddress,
        uint8[40] memory x,
        uint8[40] memory y,
        uint8[40] memory pawnIndex,
        uint8 pawnNb
    ) public {
        require(pawnNb <= 40 && pawnNb > 0, "You can place maximum 40 pawns on the board");

        // Create the board
        Board memory newBoard;
        newBoard.id = boardNumber;
        newBoard.boardContract = boardContract;
        newBoard.pawnSet = pawnSetAddress;
        newBoard.boardEvents = boardEventsAddress;
        newBoard.pawnNumber = pawnNb;
        newBoard.gameCount = 0;
        newBoard.waitingPlayer = address(0);
        boards.push(newBoard);

        // Get the pawn set to verify pawn indexes are correct
        PawnSet pawnSet = PawnSet(pawnSetAddress);
        uint8 pawnSetPawnNb = pawnSet.getPawnNb();

        // Place pawns
        for (uint8 i = 0; i < pawnNb; i++) {
            require(x[i] < 8 && y[i] < 8, "The pawn position is out of bound");
            require(pawnIndex[i] < pawnSetPawnNb, "The pawn doesn't exist");

            PawnPosition memory newPawn;
            newPawn.pawnIndex = pawnIndex[i];
            newPawn.x = x[i];
            newPawn.y = y[i];

            boards[boardNumber].pawnPosition[i] = newPawn;
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
     * @notice Finish a game, this function can only be called by the ethBoards contract, this contract ensure the winner is legit
     * @param boardId id of the board
     * @param gameId id of the game
     * @param winner player that won the game (0 or 1)
    */
    function finishGame(uint boardId, uint gameId, uint8 winner) public fromEthBoards {
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
     * @notice Get the number of pawns placed on a board
     * @param boardId id of the board
     * @return number of pawns placed on a board
    */
    function getBoardPawnNumber(uint boardId) public view returns(uint8) {
        require(boardId < boardNumber, "The board doesn't exist");

        return boards[boardId].pawnNumber;
    }

    /**
     * @notice Get pawn smart contract of a specific pawn in the pawn set of the board
     * @param boardId id of the board
     * @param pawnIndex index of the pawn in the pawn set
     * @return address of the pawn smart contract
    */
    function getBoardPawnContract(uint boardId, uint8 pawnIndex) public view returns(address) {
        require(boardId < boardNumber, "The board doesn't exist");

        // Get the pawn set
        PawnSet pawnSet = PawnSet(boards[boardId].pawnSet);

        return pawnSet.getPawn(pawnIndex);
    }

    /**
     * @notice Get the initial state of a board
     * @param boardId id of the board
     * @return state the initial state of the board
    */
    function getInitialState(uint boardId) public view returns(uint8[121] memory state) {
        require(boardId < boardNumber, "The board doesn't exist");

        // Pawn number
        state[0] = boards[boardId].pawnNumber;

        for(uint8 i = 0; i<boards[boardId].pawnNumber; i++) {
             // Pawn type
            state[1+i] = boards[boardId].pawnPosition[i].pawnIndex+1;
            // Pawn x position
            state[41+i] = boards[boardId].pawnPosition[i].x;
            // Pawn y position
            state[81+i] = boards[boardId].pawnPosition[i].y;
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
