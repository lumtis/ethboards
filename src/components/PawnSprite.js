import React, { Component } from 'react'

import store from '../store'
import { getPawnType, getPawnAt } from '../utils/stateUtils'

import Pawn from '../artifacts/Pawn.json'

class PawnSprite extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
          boardId: store.getState().game.boardId,
          spriteLink: ""
        }
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

    render() {
        const {x, y} = this.props
        const {spriteLink} = this.state
        if (spriteLink) {
            return (
                <img src={spriteLink} alt="Pawn" style={{
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
