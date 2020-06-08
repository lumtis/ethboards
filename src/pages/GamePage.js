import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"

import store from '../store'

import Board from '../components/Board'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import PawnBar from '../components/PawnBar'

import '../App.css'

class GamePageComp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initialized: false,
    }
  }

  async componentDidMount () {
    // Request the initial state of the board from the smart contract
    const {boardId, gameId, drizzleContext} = this.props

    if (drizzleContext.initialized) {
        // Call the getInitialState method
        const {drizzle, drizzleState} = drizzleContext

        try {
          const initialState = await drizzle.contracts.BoardHandler.methods.getInitialState(boardId).call()
          
          const playerIndex = await drizzle.contracts.BoardHandler.methods.getGamePlayerIndex(
            boardId,
            gameId,
            drizzleState.accounts[0]
          ).call()
          
          // Send the new state to redux
          store.dispatch({
            type: 'NEW_GAMESTATE', 
            payload: {
                newState: initialState,
                boardId,
                gameId,
                playerIndex
            }
          })
        } catch (err) {
          store.dispatch({
            type: 'RESET_STATE', 
          })
        }

        this.setState({initialized: true})
    }
  }

  render() {
    const {initialized} = this.state
    const {drizzleContext} = this.props

    if (!initialized) {
        return <Loading />
    }

    return(
      <div className="backgroundWrapper" style={{
        position:'fixed'
      }} >
        <Navbar />
        <div className="row">
          <div className="col-md-8">

            <div className="container-fluid" style={{overflowY: 'scroll', height: '100vh', paddingLeft:0, paddingRight:0}}>
              <div className="row" style={{padding: '30px'}}>
                <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
                  <Board />
                </div>
                <div className="col-md-12" style={{width:'100%', top:'570px', marginBottom: '100px'}}>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <PawnBar drizzleContext={drizzleContext} />
          </div>
        </div>
      </div>
    )
  }
}

// Drizzle consumer
class GamePage extends Component {
    render() {
        return(
            <DrizzleContext.Consumer>
            { drizzleContext => {
                const {initialized} = drizzleContext
                if(!initialized) {
                    return <Loading />
                } else {
                    return <GamePageComp 
                      drizzleContext={drizzleContext} 
                      boardId={this.props.match.params.boardId} 
                      gameId={this.props.match.params.gameId} 
                    />
                }
              }
            }
            </DrizzleContext.Consumer>
        )
    }
}

export default GamePage



