import React, { Component } from 'react'

import store from '../store'
import {getLatestStateSignature} from '../utils/stateChannelUtils'
import '../App.css' 

import Pawn from '../artifacts/Board.json'

// Options for a game
// Claiming victory
// Requesting timeout for the opponent
class GameOptions extends Component {
  constructor(props) {
    super(props)

    this.state = {
        boardState: store.getState().game.boardState,
        boardId: store.getState().game.boardId,
        gameId: store.getState().game.gameId,
        playerIndex: store.getState().game.playerIndex,
        turn: store.getState().game.turn,
        isVictorious: false,
        isOpponentVictorious: false,
        isFinished: false,
        pendingTimeout: false,
        timeoutRemainingTime: 0,
        timeoutTurnNumber: 0,
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

    this.claimVictory = this.claimVictory.bind(this)
    this.startTimeout = this.startTimeout.bind(this)
    this.executeTimeout = this.executeTimeout.bind(this)
    this.stopTimeout = this.stopTimeout.bind(this)
    this.updateRemainingTime = this.updateRemainingTime.bind(this)
  }

  async componentDidMount() {
      const {boardId, gameId, boardState, playerIndex} = this.state
      const {drizzleContext} = this.props
      const {drizzle} = drizzleContext
      const {web3} = drizzle

      // Get the address of the board
      const boardAddress = await drizzle.contracts.BoardHandler.methods.getBoardContractAddress(
          boardId,
      ).call()

      // Check if the game is finished
      const isFinished = await drizzle.contracts.BoardHandler.methods.isGameOver(
        boardId,
        gameId,
      ).call()

      if (isFinished) {
        this.setState({isFinished})
      } else {
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
          } else {
            // Check if a timeout is pending
            const timeoutInfo = await drizzle.contracts.EthBoards.methods.getTimeoutInfo(
              drizzle.contracts.BoardHandler.options.address,
              boardId,
              gameId,
            ).call()

            // If a timeout is pending, get the remaining time before we can execute it
            if (timeoutInfo.isPending) {
              const timeoutTimestamp = parseInt(timeoutInfo.timestamp)
              const currentTimestamp = Math.floor(Date.now()/1000)
              let timeoutRemainingTime = timeoutTimestamp - currentTimestamp
              if (timeoutRemainingTime < 0) {
                timeoutRemainingTime = 0
              }

              // Set the timeout infos
              this.setState({
                pendingTimeout: true,
                timeoutRemainingTime,
                timeoutTurnNumber: timeoutInfo.turnNumber
              })
              setTimeout(this.updateRemainingTime, 1000)
            } else {
              this.setState({pendingTimeout: false})
            }
          }
        }
      }
  }

  async componentDidUpdate(prevProps, prevState) {
    // Update only if there is a new turn
    if (this.state.turn !== prevState.turn) {
      const {boardId, gameId, boardState, playerIndex} = this.state
      const {drizzleContext} = this.props
      const {drizzle} = drizzleContext
      const {web3} = drizzle

      // Get the address of the board
      const boardAddress = await drizzle.contracts.BoardHandler.methods.getBoardContractAddress(
          boardId,
      ).call()

      // Check if the game is finished
      const isFinished = await drizzle.contracts.BoardHandler.methods.isGameOver(
        boardId,
        gameId,
      ).call()

      if (isFinished) {
        this.setState({isFinished})
      } else {
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
          } else {
            // Check if a timeout is pending
            const timeoutInfo = await drizzle.contracts.EthBoards.methods.getTimeoutInfo(
              drizzle.contracts.BoardHandler.options.address,
              boardId,
              gameId,
            ).call()

            // If a timeout is pending, get the remaining time before we can execute it
            if (timeoutInfo.isPending) {
              const timeoutTimestamp = parseInt(timeoutInfo.timestamp)
              const currentTimestamp = Math.floor(Date.now()/1000)
              let timeoutRemainingTime = timeoutTimestamp - currentTimestamp
              if (timeoutRemainingTime < 0) {
                timeoutRemainingTime = 0
              }

              // Set the timeout infos
              this.setState({
                pendingTimeout: true,
                timeoutRemainingTime,
                timeoutTurnNumber: timeoutInfo.turnNumber
              })
              setTimeout(this.updateRemainingTime, 1000)
            } else {
              this.setState({pendingTimeout: false})
            }
          }
        }
      }
    }
  }

  async claimVictory() {
    const {boardId, gameId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, drizzleState} = drizzleContext
    const {web3} = drizzle

    // Get the state signature from the state channel server
    const latestSignatureState = await getLatestStateSignature(boardId, gameId)

    // Send a claimVictory transaction to the smart contract
    drizzle.contracts.EthBoards.methods.claimVictory(
      drizzle.contracts.BoardHandler.options.address,
      boardId,
      gameId,
      parseInt(latestSignatureState.turn),
      latestSignatureState.move,
      [
        web3.utils.bytesToHex(latestSignatureState.r[0]),
        web3.utils.bytesToHex(latestSignatureState.r[1]),
      ],
      [
        web3.utils.bytesToHex(latestSignatureState.s[0]),
        web3.utils.bytesToHex(latestSignatureState.s[1]),
      ],
      latestSignatureState.v,
      latestSignatureState.state
    ).send({
      from: drizzleState.accounts[0]
    }).on('error', (err) => {
      console.log("Error claiming victory")
      console.log(err)
    }).on('transactionHash', (txHash) => {
      console.log("Transaction hash:")
      console.log(txHash)
    }).then(() => {
      this.setState({isFinished: true})
    })
  }

  async startTimeout() {
    const {boardId, gameId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, drizzleState} = drizzleContext
    const {web3} = drizzle

    // Get the state signature from the state channel server
    const latestSignatureState = await getLatestStateSignature(boardId, gameId)

    // Send a startTimeout transaction to the smart contract
    drizzle.contracts.EthBoards.methods.startTimeout(
      drizzle.contracts.BoardHandler.options.address,
      boardId,
      gameId,
      parseInt(latestSignatureState.turn),
      latestSignatureState.move,
      [
        web3.utils.bytesToHex(latestSignatureState.r[0]),
        web3.utils.bytesToHex(latestSignatureState.r[1]),
      ],
      [
        web3.utils.bytesToHex(latestSignatureState.s[0]),
        web3.utils.bytesToHex(latestSignatureState.s[1]),
      ],
      latestSignatureState.v,
      latestSignatureState.state
    ).send({
      from: drizzleState.accounts[0]
    }).on('error', (err) => {
      console.log("Error starting timeout")
      console.log(err)
    }).on('transactionHash', (txHash) => {
      console.log("Transaction hash:")
      console.log(txHash)
    }).then(() => {
      this.forceUpdate()
    })
  }

  async executeTimeout() {
    const {boardId, gameId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, drizzleState} = drizzleContext

    // Call smart contract
    drizzle.contracts.EthBoards.methods.executeTimeout(
      drizzle.contracts.BoardHandler.options.address,
      boardId,
      gameId,
    ).send({
      from: drizzleState.accounts[0]
    }).on('error', (err) => {
      console.log("Error starting timeout")
      console.log(err)
    }).on('transactionHash', (txHash) => {
      console.log("Transaction hash:")
      console.log(txHash)
    }).then(() => {
      this.forceUpdate()
    })
  }

  async stopTimeout() {
    const {boardId, gameId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, drizzleState} = drizzleContext
    const {web3} = drizzle

    // Get the state signature from the state channel server
    const latestSignatureState = await getLatestStateSignature(boardId, gameId)

    // Send a stopTimeout transaction to the smart contract
    drizzle.contracts.EthBoards.methods.stopTimeout(
      drizzle.contracts.BoardHandler.options.address,
      boardId,
      gameId,
      parseInt(latestSignatureState.turn),
      latestSignatureState.move,
      [
        web3.utils.bytesToHex(latestSignatureState.r[0]),
        web3.utils.bytesToHex(latestSignatureState.r[1]),
      ],
      [
        web3.utils.bytesToHex(latestSignatureState.s[0]),
        web3.utils.bytesToHex(latestSignatureState.s[1]),
      ],
      latestSignatureState.v,
      latestSignatureState.state
    ).send({
      from: drizzleState.accounts[0]
    }).on('error', (err) => {
      console.log("Error stoping timeout")
      console.log(err)
    }).on('transactionHash', (txHash) => {
      console.log("Transaction hash:")
      console.log(txHash)
    }).then(() => {
      this.forceUpdate()
    })
  }

  // To have realtime left seconds for timeout
  updateRemainingTime() {
    const remainingTime = this.state.timeoutRemainingTime
    if(remainingTime > 0) {
      this.setState({timeoutRemainingTime: remainingTime-1})
      setTimeout(this.updateRemainingTime, 1000)
    }
  }

  render() {
    // State
    const {
      playerIndex,
      turn,
      isVictorious,
      isOpponentVictorious,
      isFinished,
      pendingTimeout,
      timeoutRemainingTime,
      timeoutTurnNumber
    } = this.state

    // Component for timeout
    let timeoutBox = null
    if (pendingTimeout) {
      if (turn > timeoutTurnNumber) {
        timeoutBox = <div>
            <h1>A timeout counter has been triggered: {timeoutRemainingTime} seconds left</h1>
            <button onClick={this.stopTimeout} className="button" style={buttontyle}>Stop timeout</button>
          </div>
      }
      else if (timeoutRemainingTime > 0) {
        timeoutBox = <h1>A timeout counter has been triggered: {timeoutRemainingTime} seconds left</h1>
      } else {
        timeoutBox = <div>
          <h1>Time out!</h1>
          <button onClick={this.executeTimeout} className="button" style={buttontyle}>Kick the player</button>
        </div>
      }
    } else {
      timeoutBox = <button onClick={this.startTimeout} className="button" style={buttontyle}>Start timeout</button>
    }

    // Component to stop timeout
    let stopTimeoutBox = null
    if (pendingTimeout) {

      if (timeoutTurnNumber >= turn) {
        stopTimeoutBox = <div>
          <h1>A timeout counter has been triggered: {timeoutRemainingTime} seconds left</h1>
          <h1>Play your turn!</h1>
        </div>
      } else {
        stopTimeoutBox = <div>
          <h1>A timeout counter has been triggered: {timeoutRemainingTime} seconds left</h1>
          <button onClick={this.stopTimeout} className="button" style={buttontyle}>Stop timeout</button>
        </div>
      } 
    }

    // Components depending on the flow of the game
    const gameFinishedOption = <div>
      <h1>Game finished</h1>
    </div>

    const turnOption = <div>
      <h1>Your turn</h1>
      {stopTimeoutBox}
    </div>

    const opponentTurnOption = <div>
      <h1>Opponent's turn</h1>
      {timeoutBox}
    </div>

    const victoryOption = <div>
      <h1>You won!</h1>
      <button onClick={this.claimVictory} className="button" style={buttontyle}>Claim victory</button>
    </div>

    const defeatOption = <div>
      <h1>You lost!</h1>
      <button onClick={this.claimVictory} className="button" style={buttontyle}>Leave the game</button>
    </div>
    
    // Select which option to display
    let content = null
    if (isFinished) {
      content = gameFinishedOption
    } else if (isVictorious === true) {
      content = victoryOption
    } else if (isOpponentVictorious === true) {
      content = defeatOption
    } else {
      // Check whose turn is
      if (turn % 2 === playerIndex) {
        // Our turn
        content = turnOption
      } else {
        // Opponent turn
        content = opponentTurnOption
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
