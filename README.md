<p align="center">
  <img width="350" height="55" src="public/assets/general/title.png">
</p>

# ethboards

Ethboards is a simple smart contract platform to create board games on Ethereum.

## Smart contract platform

The smart contract platform provides smart contracts to handle 8x8 boards and simulate game turns that occur on this board.
The user provides his own smart contracts that determine the pawn's behavior in the game. He also provides a smart contract that determines when a player wins the game.

<img src="public/assets/docs/SmartContracts1.png">

## State channel

The games are automatically made fast and cheap to play through the use of state channels.
A server store into a database all the state transitions for each game.
The state transitions are signed and are used when a player claim victory.

The server for the state channels storage can be found here: https://github.com/ltacker/ethboards-statechannels

<img src="public/assets/docs/StateChannel1.png">

## TO BE CONTINUED...