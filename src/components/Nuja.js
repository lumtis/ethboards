import React, { Component } from 'react'
import store from '../store'
import imageConverter from '../utils/imageConverter'

var ipfsAPI = require('ipfs-api')
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
      imageData: '',
      description: '',
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
      self.state.nujaRegistry.methods.getContract(nujaIndex).call().then(function(addressRet) {
        var nujaContract = new self.state.web3.eth.Contract(nujaJson.abi, addressRet)

        nujaContract.methods.getMetadata().call().then(function(ipfsString) {
          ipfs.files.get(ipfsString + '/image.png', function (err, files) {
            self.setState({imageData: "data:image/png;base64,"+imageConverter(files[0].content)})
          })
          ipfs.files.get(ipfsString + '/name/default', function (err, files) {
            self.setState({name: files[0].content.toString('utf8')})
          })
          ipfs.files.get(ipfsString + '/description/default', function (err, files) {
            self.setState({description: files[0].content.toString('utf8')})
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
            <img src={this.state.imageData} alt="Nuja" style={{height: '115px'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>{this.state.description}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Nuja
