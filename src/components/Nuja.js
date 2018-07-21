import React, { Component } from 'react'
import store from '../store'
import imageConverter from '../utils/imageConverter'
import ipfsGet from '../utils/ipfsGet'


var nujaJson = require('../../build/contracts/Nuja.json')


const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  // boxShadow:'5px 5px rgba(0, 0, 0, 1)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};


class Nuja extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaRegistry: store.getState().web3.nujaRegistryInstance,
      web3: store.getState().web3.web3Instance,
      imageLink: '',
      power: '',
      name: ''
    }

    store.subscribe(() => {
      this.setState({
        nujaRegistry: store.getState().web3.nujaRegistryInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
        web3: store.getState().web3.web3Instance,
      })
    })
  }

  static defaultProps = {
    nujaIndex: 0
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaRegistry != null) {
      // Get ipfs data
      self.state.nujaRegistry.methods.getContract(self.props.nujaIndex).call().then(function(addressRet) {
        var nujaContract = new self.state.web3.eth.Contract(nujaJson.abi, addressRet)

        nujaContract.methods.getMetadata().call().then(function(ipfsString) {
          self.setState({imageLink: 'https://ipfs.infura.io' + ipfsString + '/image.png'})
          ipfsGet(ipfsString + '/name/default', function(response) {
            self.setState({name: response.toString('utf8')})
          })
          ipfsGet(ipfsString + '/power/default', function(response) {
            self.setState({power: response.toString('utf8')})
          })
        })
      })
    }
  }

  render() {
    return(
      <div style={infoStyle}>
        <h1>{this.state.name}</h1>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-6" style={{}}>
            <img src={this.state.imageLink} alt="Nuja" style={{height: '115px'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>{this.state.power}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Nuja
