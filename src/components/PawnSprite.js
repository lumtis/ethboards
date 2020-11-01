import React, { Component } from 'react'

import store from '../store'
import {getPawnType} from '../utils/stateUtils'

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
    }

    async componentDidMount() {
        const {boardState, boardId} = this.state
        const {pawn, drizzleContext} = this.props
        const {drizzle} = drizzleContext
        const {web3} = drizzle

        // Get the address of the pawn
        const pawnAddress = await drizzle.contracts.BoardHandler.methods.getBoardPawnContract(
            boardId,
            getPawnType(boardState, pawn)
        ).call()

        // Add the contract of the pawn
        const contractConfig = {
            contractName: pawnAddress,
            web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
        }
        drizzle.addContract(contractConfig)

        // Get the metadata
        const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
        this.setState({spriteLink: process.env.REACT_APP_IPFS_URL + ipfsPath + '/image.png'})
    }

    async componentDidUpdate(prevProps, prevState) {
        // Update only if there is a new pawn
        if (this.props.pawn !== prevProps.pawn) {
            const {boardState, boardId} = this.state
            const {pawn, drizzleContext} = this.props
            const {drizzle} = drizzleContext
            const {web3} = drizzle
    
            // Get the address of the pawn
            const pawnAddress = await drizzle.contracts.BoardHandler.methods.getBoardPawnContract(
                boardId,
                getPawnType(boardState, pawn)
            ).call()
    
            // Add the contract of the pawn
            const contractConfig = {
                contractName: pawnAddress,
                web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
            }
            drizzle.addContract(contractConfig)
    
            // Get the metadata
            const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
            this.setState({spriteLink: process.env.REACT_APP_IPFS_URL + ipfsPath + '/image.png'})
        }     
    }

    render() {
        const {pawn, x, y} = this.props
        const {spriteLink} = this.state
        if (spriteLink) {
            return (
                <img onClick={() => {
                    // Select the pawn to give information in the side bar
                    store.dispatch({
                        type: 'SELECT_PAWN', 
                        payload: {
                            selectedPawn: pawn,
                        }
                    })
                    store.dispatch({
                        type: 'RESET_CROSSES', 
                    })
                } } src={spriteLink} alt="Pawn" style={{
                    cursor: 'pointer',
                    width: '10%',
                    height: '10%',
                    position: 'absolute',
                    top: y+1+'%',
                    left: x+1+'%'
                }}></img>
            )
        } else {
            return null
        }        
    }
}

export default PawnSprite
