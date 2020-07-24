import React, { Component } from 'react'
import ethjs from 'ethereumjs-util'

import store from '../store'
import {sendMove} from '../utils/stateChannelUtils'

class Cross extends Component {
    constructor(props) {
        super(props)

        this.state = {
            boardState: store.getState().game.boardState,
            boardId: store.getState().game.boardId,
            gameId: store.getState().game.gameId,
            turn: store.getState().game.turn,
            selectedPawn: store.getState().game.selectedPawn,
        }

        this.sendMove = this.sendMove.bind(this)
    }
    
    // Send the signed move to the state channel server
    async sendMove() {
        const {x, y, drizzleContext} = this.props
        const pawn = this.state.selectedPawn
        const {boardState, boardId, gameId, turn} = this.state
        const {drizzle, drizzleState} = drizzleContext
        const {web3} = drizzle

        if (pawn !== -1) {
            // Nonce is used to ensure the uniqueness of the signature
            const nonce = [boardId, gameId, turn]
            const move = [pawn, 0, x, y]

            // Sign the move
            const sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
                {t: 'uint[]', v: nonce},
                {t: 'uint[]', v: move},
                {t: 'uint[]', v: boardState},
            ), drizzleState.accounts[0])

            const rsv = ethjs.fromRpcSig(sig)

            const response = await sendMove(boardId, gameId, move, rsv)
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
