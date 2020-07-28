import React, { Component } from 'react'

import store from '../store'
import {ipfsGet} from '../utils/ipfsUtils'

import Board from '../artifacts/Board.json'

class BoardInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            boardState: store.getState().game.boardState,
            boardId: store.getState().game.boardId,
            imageLink: "",
            name: "",
            etherscanLink: "",
            description: "",
        }
    }

    async componentDidMount() {
        const {boardId, drizzleContext} = this.props
        const {drizzle} = drizzleContext
        const {web3} = drizzle

        // Get the address of the board
        const boardAddress = await drizzle.contracts.BoardHandler.methods.getBoardContractAddress(
            boardId,
        ).call()

        const boardContract = {
            contractName: boardAddress,
            web3Contract: new web3.eth.Contract(Board.abi, boardAddress)
        }
        drizzle.addContract(boardContract)

        // Get the ipfs metadata
        const ipfsPath = await drizzle.contracts[boardAddress].methods.getMetadata().call()
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
        }

        // Get the etherscan link
        const network = await web3.eth.net.getId()

        if (network === 4) {
            // Rinkeby
            const etherscanLink = 'https://rinkeby.etherscan.io/address/' + boardAddress
            this.setState({etherscanLink})
        } else if (network === 1) {
            // Mainnet
            const etherscanLink = 'https://etherscan.io/address/' + boardAddress
            this.setState({etherscanLink})
        }
    }

    render() {
        const {imageLink, name, etherscanLink, description} = this.state
        const {onlyImage} = this.props

        let image = null
        if (imageLink) {
            image = <img src={imageLink} alt="Pawn" style={{width: '100%'}}></img>
        }
        
        let nameComp = null
        if (etherscanLink) {
            nameComp = <a href={etherscanLink}><h1>{name}</h1></a>
        } else {
            nameComp = <h1>{name}</h1>
        }

        const descriptionComp = <p>{description}</p>

        if (onlyImage) {
            image = <img src={imageLink} alt="Pawn" style={{
                height: '100px',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
            }}></img>
            return (
                <div className="row" style={{padding: '10px'}}>
                    <div className="col-md-12">
                        {image}
                    </div>
                </div>
            )
        } else {
            return (
                <div className="row" style={{padding: '10px'}}>
                    <div className="col-md-4">
                        {image}
                    </div>
                    <div className="col-md-8">
                        {nameComp}
                        {descriptionComp}
                    </div>
                </div>
            )
        }
    }
}

export default BoardInfo