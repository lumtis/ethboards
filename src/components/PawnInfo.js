import React, { Component } from 'react'

import Pawn from '../artifacts/Pawn.json'
import {ipfsGet} from '../utils/ipfsUtils'

class PawnInfo extends Component {
    constructor(props) {
        super(props)

        this.state = {
            imageLink: "",
            name: ""
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
                imageLink: 'http://127.0.0.1:8080' + ipfsPath + '/image.png'
            })
    
            // Get the name
            const self = this
            ipfsGet(ipfsPath + '/name/default', (response) => {
                self.setState({name: response.toString('utf8')})
            })
        }
    }

    render() {
        const {imageLink, name} = this.state
        let image = null
        if (imageLink) {
            image = <img src={imageLink} alt="Pawn" style={{width: '50px'}}></img>
        }
        

        return (
            <div className="row" style={{padding: '10px'}}>
                <div className="col-md-4">
                    {image}
                </div>
                <div className="col-md-8">
                    <h1>{name}</h1>
                </div>
            </div>
        )
    }
}

export default PawnInfo