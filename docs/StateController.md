## `StateController`

Contain functions to control transition of the game state




### `getPawnNumber(uint8[121] state) → uint8` (public)

Get the number of pawns in the game




### `getPawnPosition(uint8[121] state, uint8 pawn) → uint8, uint8` (public)

Get the position of a specific pawn in the game




### `getPawnType(uint8[121] state, uint8 pawn) → uint8` (public)

Get the type of a specific pawn in the game, the type is what defines the pawn (e.g allows to get the specific smart contract of the pawn)




### `isAlive(uint8[121] state, uint8 pawn) → bool` (public)

Determine if a specific pawn in the game is still alive




### `getPawnAt(uint8[121] state, uint8 x, uint256 y) → int8` (public)

Get the pawn present in a specific location in the map




### `noPawnAt(uint8[121] state, uint8 x, uint256 y) → bool` (public)

Check if a pawn is present on a specific location




### `movePawn(uint8[121] state, uint8 pawn, uint8 x, uint8 y) → uint8[121]` (public)

Perform the state transition when moving a pawn on the map




### `removePawn(uint8[121] state, uint8 pawn) → uint8[121]` (public)

Perform the state transition when removing a pawn from the game




### `respawnPawn(uint8[121] state, uint8 pawn, uint8 pawnType, uint8 x, uint8 y) → uint8[121]` (public)

Perform the state transition when change the pawn type or revive a pawn in the game





