import React, { Component } from 'react'

import store from '../store'
import '../App.css' 

import Pawn from '../artifacts/Board.json'

// Graphical representation of a board
class GameOptions extends Component {
  constructor(props) {
    super(props)

    this.state = {
        boardState: store.getState().game.boardState,
        boardId: store.getState().game.boardId,
        playerIndex: store.getState().game.playerIndex,
        turn: store.getState().game.turn,
        isVictorious: false,
        isOpponentVictorious: false,
    }

    store.subscribe(() => {
      this.setState({
        boardState: store.getState().game.boardState,
        boardId: store.getState().game.boardId,
        gameId: store.getState().game.gameId,
        playerIndex: store.getState().game.playerIndex,
        turn: store.getState().game.turn,
      })
    })
  }

  async componentDidMount() {
      const {boardId, boardState, playerIndex} = this.state
      const {drizzleContext} = this.props
      const {drizzle} = drizzleContext
      const {web3} = drizzle

      // Get the address of the board
      const boardAddress = await drizzle.contracts.BoardHandler.methods.getBoardContractAddress(
          boardId,
      ).call()

      // Add the contract of the board
      const contractConfig = {
          contractName: boardAddress,
          web3Contract: new web3.eth.Contract(Pawn.abi, boardAddress)
      }
      drizzle.addContract(contractConfig)

      // Check victory
      const isVictorious = await drizzle.contracts[boardAddress].methods.checkVictory(
        playerIndex,
        boardState
      ).call()

      if (isVictorious) {
        // If the player is victorious we change the state
        this.setState({isVictorious})
      } else {
        // Check opponent victory
        const opponent = playerIndex === 1 ? 0 : 1
        const isOpponentVictorious = await drizzle.contracts[boardAddress].methods.checkVictory(
          opponent,
          boardState
        ).call()
        if (isOpponentVictorious) {
          this.setState({isOpponentVictorious})
        }
      }
  }

  async componentDidUpdate(prevProps, prevState) {
    // Update only if there is a new turn
    if (this.state.turn !== prevState.turn) {
      const {boardId, boardState, playerIndex} = this.state
      const {drizzleContext} = this.props
      const {drizzle} = drizzleContext
      const {web3} = drizzle

      // Get the address of the board
      const boardAddress = await drizzle.contracts.BoardHandler.methods.getBoardContractAddress(
          boardId,
      ).call()

      // Add the contract of the board
      const contractConfig = {
          contractName: boardAddress,
          web3Contract: new web3.eth.Contract(Pawn.abi, boardAddress)
      }
      drizzle.addContract(contractConfig)

      // Check victory
      const isVictorious = await drizzle.contracts[boardAddress].methods.checkVictory(
        playerIndex,
        boardState
      ).call()

      if (isVictorious) {
        // If the player is victorious we change the state
        this.setState({isVictorious})
      } else {
        // Check opponent victory
        const opponent = playerIndex === 1 ? 0 : 1
        const isOpponentVictorious = await drizzle.contracts[boardAddress].methods.checkVictory(
          opponent,
          boardState
        ).call()
        if (isOpponentVictorious) {
          this.setState({isOpponentVictorious})
        }
      }
    }
  }

  render() {
    const {playerIndex, turn, isVictorious, isOpponentVictorious} = this.state
    let content = null

    if (isVictorious === true) {
      content = <div>
          <h1>You won!</h1>
          <button className="button" style={buttontyle}>Claim victory</button>
        </div>
    } else if (isOpponentVictorious === true) {
      content = <div>
          <h1>You lost!</h1>
          <button className="button" style={buttontyle}>Leave the game</button>
        </div>
    } else {
      // Check whose turn is
      if (turn % 2 === playerIndex) {
        // Our turn
        content = <div>
          <h1>Your turn</h1>
        </div>
      } else {
        // Opponent turn
        content = <div>
          <h1>Opponent's turn</h1>
        </div>
      }
    }

    return(
      <div style={boxStyle}>
        {content}
      </div>
    )
  }
}

const boxStyle = {
    marginTop: '20px',
    padding: '20px',
    width: '100%',
    minHeight: '100px',
    backgroundColor: 'rgba(126, 126, 126, 0.5)',
}

  const buttontyle = {
    width: '200px',
    height: '60px',
    fontSize: '18px',
}

export default GameOptions
