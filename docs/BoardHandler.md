## `BoardHandler`

The storage contract, store the informations about boards and games



### `fromEthBoards()`






### `constructor(address ethBoardsAddress)` (public)





### `createBoard(string name, address boardContract)` (public)

Create a new board




### `addPawnTypeToBoard(uint256 boardId, address pawnTypeAddress)` (public)

Add a new pawn type for the board, pawn type represents the behavior of a pawn in the board, there can be several occurence of the smae pawn type on the game




### `addPawnsToBoard(uint256 boardId, uint8[10] x, uint8[10] y, uint8[10] pawnType, uint8 nbPawn)` (public)

Add pawns onto the board, up to 10 pawns can be added




### `resetBoard(uint256 boardId)` (public)

Remove all pawn for a board, this board must not be deployed yet




### `deployBoard(uint256 boardId)` (public)

Deploy a board, once deployed, no pawn can be added to the board anymore and game can be started from the board




### `joinGame(uint256 boardId)` (public)

Join a new game on a board. When a player joins a game, he's in the waiting room for the game, if someone is present in the waiting room, the game is started against this player




### `finishGame(uint256 boardId, uint256 gameId, uint8 winner)` (public)

Finish a game, this function can only be called by the ethBoards contract, this contract ensure the winner is legit




### `getBoardNumber() → uint256` (public)

Get the number of boards




### `getBoardContractAddress(uint256 boardId) → address` (public)

Get the address of the smart contract of the board




### `isDeployed(uint256 boardId) → bool` (public)

Check if a board is deployed and games can be started on it




### `getBoardPawnTypeNumber(uint256 boardId) → uint8` (public)

Get the number of pawn types on a board




### `getBoardPawnTypeContract(uint256 boardId, uint8 pawnType) → address` (public)

Get pawn smart contract of a specific pawn type in a board




### `getBoardPawnNumber(uint256 boardId) → uint8` (public)

Get the number of pawns placed on a board




### `getBoardPawnTypeContractFromPawnIndex(uint256 boardId, uint8 pawnIndex) → address` (public)

Get pawn smart contract of a specific pawn placed on a board




### `getInitialState(uint256 boardId) → uint8[121] state` (public)

Get the initial state of a board




### `getGameNumber(uint256 boardId) → uint256` (public)

Get the number of game occurences of a board




### `isWaitingPlayer(uint256 boardId) → bool isWaiting, address waitingPlayer` (public)

Check if a player is currently waiting to play a game on a board




### `isGameOver(uint256 boardId, uint256 gameId) → bool` (public)

Check if a specifc game of a board is finished




### `getGamePlayerAddress(uint256 boardId, uint256 gameId, uint256 turnNumber) → address` (public)

Get the address of a player in the game




### `getGamePlayerIndex(uint256 boardId, uint256 gameId, address playerAddress) → int256` (public)

Check from the player address, if it's player A or B





### `BoardCreated(address creator, uint256 boardId, string name)`

Emitted when a new board is created




### `PawnTypeAdded(uint256 boardId, address pawnTypeContract)`

Emitted when a new pawn type is added to a board




### `GameStarted(address playerA, address playerB, uint256 boardId, uint256 gameId)`

Emitted when a new game is started




### `GameFinished(address playerA, address playerB, address winner, uint256 boardId, uint256 gameId)`

Emitted when a new game is finished




