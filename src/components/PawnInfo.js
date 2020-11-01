import React, { Component } from 'react'

import store from '../store'
import Pawn from '../artifacts/Pawn.json'
import {ipfsGet} from '../utils/ipfsUtils'
import {getPawnType} from '../utils/stateUtils'
import {testSimulate} from '../utils/gameUtils'


class PawnInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            boardState: store.getState().game.boardState,
            boardId: store.getState().game.boardId,
            gameId: store.getState().game.gameId,
            playerIndex: store.getState().game.playerIndex,
            imageLink: "",
            name: "",
            etherscanLink: "",
            description: "",
            simulationsPending: false,
            moveNames: []
        }
        this.performSimulation = this.performSimulation.bind(this)
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

        // If the contract of the pawn hasn't been added to the drizzle context, we add it
        if (!drizzle.contracts[pawnAddress]) {
            // Add the contract of the pawn
            const contractConfig = {
                contractName: pawnAddress,
                web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
            }
            drizzle.addContract(contractConfig)
        }

        // Get the ipfs metadata
        const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
        if (ipfsPath) {
            // Get the image
            this.setState({
                imageLink: process.env.REACT_APP_IPFS_URL + ipfsPath + '/image.png'
            })
    
            // Get the name
            let response = await ipfsGet(ipfsPath + '/name')
            if (response) {
                this.setState({name: response.toString('utf8')})
            }

            // Get the description
            response = await ipfsGet(ipfsPath + '/description')
            if (response) {
                this.setState({description: response.toString('utf8')})
            }

            // Get the move names
            const moveNumber = await drizzle.contracts[pawnAddress].methods.getMoveNumber().call()
            const moveNames = []
            for(let i=0; i<moveNumber; i++) {
                response = await ipfsGet(ipfsPath + '/' + i.toString())
                if (response) {
                    moveNames.push(response.toString('utf8'))
                }
            }
            this.setState({moveNames})
        }

        // Get the etherscan link
        const network = await web3.eth.net.getId()

        if (network === 4) {
            // Rinkeby
            const etherscanLink = 'https://rinkeby.etherscan.io/address/' + pawnAddress
            this.setState({etherscanLink})
        } else if (network === 1) {
            // Mainnet
            const etherscanLink = 'https://etherscan.io/address/' + pawnAddress
            this.setState({etherscanLink})
        }
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

            // If the contract of the pawn hasn't been added to the drizzle context, we add it
            if (!drizzle.contracts[pawnAddress]) {
                // Add the contract of the pawn
                const contractConfig = {
                    contractName: pawnAddress,
                    web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
                }
                drizzle.addContract(contractConfig)
            }

            // Get the ipfs metadata
            const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
            if (ipfsPath) {
                // Get the image
                this.setState({
                    imageLink: process.env.REACT_APP_IPFS_URL + ipfsPath + '/image.png'
                })
        
                // Get the name
                let response = await ipfsGet(ipfsPath + '/name')
                if (response) {
                    this.setState({name: response.toString('utf8')})
                }

                // Get the description
                response = await ipfsGet(ipfsPath + '/description')
                if (response) {
                    this.setState({description: response.toString('utf8')})
                }

                // Get the move names
                const moveNumber = await drizzle.contracts[pawnAddress].methods.getMoveNumber().call()
                const moveNames = []
                for(let i=0; i<moveNumber; i++) {
                    response = await ipfsGet(ipfsPath + '/' + i.toString())
                    if (response) {
                        moveNames.push(response.toString('utf8'))
                    }
                }
                this.setState({moveNames})
            }

            // Get the etherscan link
            const network = await web3.eth.net.getId()

            if (network === 4) {
                // Rinkeby
                const etherscanLink = 'https://rinkeby.etherscan.io/address/' + pawnAddress
                this.setState({etherscanLink})
            } else if (network === 1) {
                // Mainnet
                const etherscanLink = 'https://etherscan.io/address/' + pawnAddress
                this.setState({etherscanLink})
            }
        }
    }

    async performSimulation(moveId) {
        const {boardState, boardId, gameId, playerIndex} = this.state
        const {pawn, drizzleContext} = this.props
        const {drizzle} = drizzleContext

        const simulations = []
                
        store.dispatch({
            type: 'RESET_CROSSES', 
        })
        store.dispatch({
            type: 'SELECT_MOVE', 
            payload: {
                selectedMove: moveId,
            }
        })

        // No simulation if not game
        if (gameId > -1) {

            this.setState({simulationsPending:true})

            const crossesToAdd = {}

            // Simulate the move on every tile
            for (let i=0; i<8; i++) {
                for (let j=0; j<8; j++) {
                    const move = [pawn, moveId, i, j]

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
                }
            })
            this.setState({simulationsPending:false})
        }
    }

    render() {
        const {imageLink, name, etherscanLink, description, simulationsPending, moveNames} = this.state
        const {pawn} = this.props

        let image = null
        if (imageLink) {
            image = <img src={imageLink} alt="Pawn" style={{width: '50px'}}></img>
        }
        
        let nameComp = null
        if (etherscanLink) {
            nameComp = <a href={etherscanLink}><h3>{name}</h3></a>
        } else {
            nameComp = <h3>{name}</h3>
        }

        const descriptionComp = <p>{description}</p>

        let loading = null
        if (simulationsPending) {
            loading = <div>
                <p>Performing simulations...</p>
            </div>
        }

        let moveButtons = []
        for (let i=0; i<moveNames.length; i++) {
            moveButtons.push(<button onClick={() => this.performSimulation(i)} className="button" style={buttontyle}>{moveNames[i]}</button>)
        }

        return (
            <div className="row" style={{padding: '10px'}}>
                <div className="col-md-12">
                    <h3>Pawn {pawn}</h3>
                </div>
                <div className="col-md-4">
                    {image}
                </div>
                <div className="col-md-8">
                    {nameComp}
                    {descriptionComp}
                </div>
                <div className="col-md-12">  
                    <div style={{marginTop: '30px'}}>
                        {loading}
                        {moveButtons}
                    </div>
                </div>
            </div>
        )
    }
}

const buttontyle = {
    width: '200px',
    height: '60px',
    fontSize: '18px',
    margin: '5px'
}

export default PawnInfo