import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"

import store from '../store'

import Board from '../components/Board'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'


class BoardPageComp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      initialized: false,
    }
  }

  async componentDidMount () {
    // Request the initial state of the board from the smart contract
    const {boardId, drizzleContext} = this.props

    if (drizzleContext.initialized) {
        // Call the getInitialState method
        const {drizzle} = drizzleContext

        try {
          const initialState = await drizzle.contracts.BoardHandler.methods.getInitialState(boardId).call()
          // Send the new state to redux
          store.dispatch({
            type: 'NEW_GAMESTATE', 
            payload: {
                newState: initialState,
                boardId
            }
          })
        } catch (err) {
          store.dispatch({
            type: 'RESET_GAMESTATE', 
          })
        }

        this.setState({initialized: true})
    }
  }

  render() {
    const {initialized} = this.state

    if (!initialized) {
        return <Loading />
    }

    return(
      <div>
        <Navbar />
        <Board />
      </div>
    )
  }
}

// Drizzle consumer
class BoardPage extends Component {
    render() {
        return(
            <DrizzleContext.Consumer>
            { drizzleContext => {
                const {initialized} = drizzleContext
                if(!initialized) {
                    return <Loading />
                } else {
                    return <BoardPageComp drizzleContext={drizzleContext} boardId={this.props.match.params.boardId} />
                }
              }
            }
            </DrizzleContext.Consumer>
        )
    }
}

export default BoardPage



