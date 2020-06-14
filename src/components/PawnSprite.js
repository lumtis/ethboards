import React, { Component } from 'react'

import store from '../store'
import {testSimulate} from '../utils/gameUtils'

import Pawn from '../artifacts/Pawn.json'

class PawnSprite extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          boardState: store.getState().game.boardState,
          boardId: store.getState().game.boardId,
          gameId: store.getState().game.gameId,
          playerIndex: store.getState().game.playerIndex,
          spriteLink: ""
        }

        this.performSimulation = this.performSimulation.bind(this)
    }

    async componentDidMount() {
        const {boardId} = this.state
        const {pawn, drizzleContext} = this.props
        const {drizzle} = drizzleContext
        const {web3} = drizzle

        // Get the address of the pawn
        const pawnAddress = await drizzle.contracts.BoardHandler.methods.getBoardPawnTypeContractFromPawnIndex(
            boardId,
            pawn
        ).call()

        // Add the contract of the pawn
        const contractConfig = {
            contractName: pawnAddress,
            web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
        }
        drizzle.addContract(contractConfig)

        // Get the metadata
        const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
        this.setState({spriteLink: 'http://127.0.0.1:8080' + ipfsPath + '/image.png'})
    }

    async componentDidUpdate(prevProps, prevState) {
        // Update only if there is a new pawn
        if (this.props.pawn !== prevProps.pawn) {
            const {boardId} = this.state
            const {pawn, drizzleContext} = this.props
            const {drizzle} = drizzleContext
            const {web3} = drizzle
    
            // Get the address of the pawn
            const pawnAddress = await drizzle.contracts.BoardHandler.methods.getBoardPawnTypeContractFromPawnIndex(
                boardId,
                pawn
            ).call()
    
            // Add the contract of the pawn
            const contractConfig = {
                contractName: pawnAddress,
                web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
            }
            drizzle.addContract(contractConfig)
    
            // Get the metadata
            const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
            this.setState({spriteLink: 'http://127.0.0.1:8080' + ipfsPath + '/image.png'})
        }     
    }

    async performSimulation() {
        const {boardState, boardId, gameId, playerIndex} = this.state
        const {pawn, drizzleContext} = this.props
        const {drizzle} = drizzleContext

        const simulations = []

        store.dispatch({
            type: 'RESET_CROSSES', 
        })

        // No simulation if not game
        if (gameId > -1) {

            const crossesToAdd = {}

            // Simulate the move on every tile
            for (let i=0; i<8; i++) {
                for (let j=0; j<8; j++) {
                    const move = [pawn, 0, i, j]

                    const simulation = testSimulate(
                        drizzle,
                        boardId,
                        playerIndex,
                        move,
                        boardState,
                    ).then((coordinates) => {
                        // If not null => the simulation passed
                        if (coordinates) {
                            crossesToAdd[coordinates[0]*8+coordinates[1]] = true
                        }
                    })

                    simulations.push(simulation)
                }
            }

            // Wait for all simulation to finish
            await Promise.all(simulations)



            // Send the crosses to add to the UI
            // Send the new state to redux
            store.dispatch({
                type: 'DISPLAY_CROSSES', 
                payload: {
                    crosses: crossesToAdd,
                    selectedPawn: pawn
                }
            })
        }
    }

    render() {
        const {x, y} = this.props
        const {spriteLink} = this.state
        if (spriteLink) {
            return (
                <img onClick={this.performSimulation} src={spriteLink} alt="Pawn" style={{
                    cursor: 'pointer',
                    width: '32px',
                    position: 'absolute',
                    top: y+16+'px',
                    left: x+16+'px'
                }}></img>
            )
        } else {
            return null
        }        
    }
}

export default PawnSprite
