## `EthBoards`

The contract for the logical flow of games, simulate turns, check turns legitimacy and claim victory




### `simulate(address boardHandlerAddress, uint256 boardId, uint8 player, uint8[4] move, uint8[121] state) → uint8[121]` (public)

Simulate the state transition when performing a move on the game




### `getTurnSignatureAddress(uint8[121] state, uint256[3] nonce, uint8[4] move, bytes32 r, bytes32 s, uint8 v) → address` (public)

Get from a turn signature (nonce, move, input state) the address of the signer, allow to verify if the player performing a move has correctly signed it




### `claimVictory(address boardHandlerAddress, uint256 boardId, uint256 gameId, uint256 initialTurnNumber, uint8[4][2] move, bytes32[2] r, bytes32[2] s, uint8[2] v, uint8[121] inputState)` (public)

Allow a player to claim victory if the state of the game is victorious for the player, if it's the case, the finishGame of the board handler contract is called


To check if the state is victorious, we give the two last turns to ensure the state is legitime (signed by the two players)



