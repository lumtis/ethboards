import React, { Component } from 'react'

import store from '../store'
import {sendMove} from '../utils/stateChannelUtils'

class Cross extends Component {
    constructor(props) {
        super(props)

        this.state = {
            boardId: store.getState().game.boardId,
            gameId: store.getState().game.gameId,
            playerIndex: store.getState().game.playerIndex,
            selectedPawn: store.getState().game.selectedPawn,
        }

        this.sendMove = this.sendMove.bind(this)
    }
    
    // Send the signed move to the state channel server
    async sendMove() {
        const {x, y, drizzleContext} = this.props
        const pawn = this.state.selectedPawn
        const {boardId, gameId} = this.state
        const {drizzle} = drizzleContext

        const move = [pawn, 0, x, y]

        const response = await sendMove(boardId, gameId, move)
        if (response) {
            store.dispatch({
                type: 'NEW_GAMESTATE', 
                payload: {
                    newState: response.newState,
                    turn: response.newTurn,
                }
            })
        }
        store.dispatch({
            type: 'RESET_CROSSES', 
        })
    }

    render() {
        const {x, y} = this.props
        const offsetX = x*64
        const offsetY = y*64

        return <img onClick={this.sendMove} src="/assets/game/bluecross.png" alt="Cross" style={{
            cursor: 'pointer',
            width: '32px',
            position: 'absolute',
            top: offsetY+16+'px',
            left: offsetX+16+'px'
        }}></img>
    }
}

export default Cross
