import React, { Component } from 'react'

import store from '../store'
import '../App.css' 

class JoinBox extends Component {
  constructor(props) {
    super(props)

    this.state = {
        waitingAddress: '',
        boardId: store.getState().game.boardId,
        joinError: '',
        joinPending: false,
    }

    store.subscribe(() => {
      this.setState({
        boardId: store.getState().game.boardId,
      })
    })

    this.join = this.join.bind(this)
  }

  async componentDidMount() {
    const {boardId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, initialized} = drizzleContext

    if (initialized) {
        const waitingPlayer = await drizzle.contracts.BoardHandler.methods.isWaitingPlayer(
          boardId,
        ).call()

        if (waitingPlayer.isWaiting) {
          this.setState({
            waitingAddress: waitingPlayer.waitingPlayer,
          })
        } else {
          this.setState({
            waitingAddress: '',
          })
        }
    }
  }

  join() {
    const {drizzleContext} = this.props
    const {drizzle, drizzleState} = drizzleContext
    const {boardId} = this.state
    
    drizzle.contracts.BoardHandler.methods.joinGame(boardId).send({
      from: drizzleState.accounts[0]
    }).on('error', (err) => {
      this.setState({joinError: err.message})
    }).on('transactionHash', (txHash) => {
      this.setState({joinPending: true})
    }).then(() => {
      this.setState({joinPending: false})
    })

  }

  render() {
    let content = null
    const {waitingAddress, joinError, joinPending} = this.state
    const {drizzleContext} = this.props
    const {drizzleState} = drizzleContext

    if (joinError) {
      content = <div>
        <p>{joinError}</p>
      </div>
    } else if (joinPending) {
      content = <h1>Joining the game....</h1>
    } else if (waitingAddress) {
      if (waitingAddress === drizzleState.accounts[0]) {
        // If this is the same address you can't join the same game
        content = <div>
          <h1>Waiting for another player to join the game</h1>
        </div>
      } else {
        // If no players are waiting we can join and wait
        content = <div>
          <h1>Someone is waiting to start a game</h1>
          <p>Address: {waitingAddress}</p>
          <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
            <button className="button" style={buttontyle} onClick={this.join}>Start a game</button>
          </div>
        </div>
      }
    } else {
      // If a player is already waiting, we can start the game
      content = <div>
        <h1>Join a game and wait for an opponent</h1>
        <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
          <button className="button" style={buttontyle} onClick={this.join}>Join a game</button>
        </div>
      </div>
    }

    return(
      <div style={boxStyle}>
        {content}
      </div>
    )
  }
}

const boxStyle = {
  padding: '20px',
  width: '100%',
  minHeight: '100px',
  backgroundColor: 'rgba(126, 126, 126, 0.5)',
}

const buttontyle = {
  width: '140px',
  height: '60px',
  fontSize: '18px',
}

export default JoinBox
