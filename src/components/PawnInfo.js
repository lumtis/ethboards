import React, { Component } from 'react'

import Pawn from '../artifacts/Pawn.json'
import {ipfsGet} from '../utils/ipfsUtils'

class PawnInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            imageLink: "",
            name: "",
            etherscanLink: "",
        }
    }

    async componentDidMount() {
        const {pawnAddress, drizzleContext} = this.props
        const {drizzle} = drizzleContext
        const {web3} = drizzle

        // If the contract of the pawn hasn't been added to the drizzle context, we add it
        if (!drizzle.contracts[pawnAddress]) {
            // Add the contract of the pawn
            const contractConfig = {
                contractName: pawnAddress,
                web3Contract: new web3.eth.Contract(Pawn.abi, pawnAddress)
            }
            drizzle.addContract(contractConfig)
        }

        // Get the image
        const ipfsPath = await drizzle.contracts[pawnAddress].methods.getMetadata().call()
        if (ipfsPath) {
            this.setState({
                imageLink: process.env.REACT_APP_IPFS_URL + ipfsPath + '/image.png'
            })
    
            // Get the name
            const response = await ipfsGet(ipfsPath + '/name/default')
            if (response) {
                this.setState({name: response.toString('utf8')})
            }
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

    render() {
        const {imageLink, name, etherscanLink} = this.state
        let image = null
        if (imageLink) {
            image = <img src={imageLink} alt="Pawn" style={{width: '50px'}}></img>
        }
        
        let nameComp = null
        if (etherscanLink) {
            nameComp = <a href={etherscanLink}><h1>{name}</h1></a>
        } else {
            nameComp = <h1>{name}</h1>
        }

        return (
            <div className="row" style={{padding: '10px'}}>
                <div className="col-md-4">
                    {image}
                </div>
                <div className="col-md-8">
                    {nameComp}
                </div>
            </div>
        )
    }
}

export default PawnInfo