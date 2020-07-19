## `Pawn`

The interface that must implement pawn's smart contract, the functions describe the pawn behavior and metadata




### `getMetadata() → string` (external)

Allow to retrieve the metadata of the pawn




### `getMoveNumber() → uint8` (external)

Retrieve the number of moves implemented by the pawn




### `performMove(uint8 player, uint8 pawn, uint8 moveType, uint8 x, uint8 y, uint8[121] state) → uint8[121]` (external)

Perform the state transition when performing a move of the pawn





