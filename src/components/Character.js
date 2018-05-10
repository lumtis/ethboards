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


class Character extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaRegistry: store.getState().web3.nujaRegistryInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      web3: store.getState().web3.web3Instance,
      nickname: '',
      imageData: '',
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
    charaterIndex: 0
  }

  componentWillMount() {
    var self = this

    if (self.state.characterRegistry != null) {
      if (self.state.nujaRegistry != null) {

        // Get the nickname
        self.state.characterRegistry.methods.getCharacterInfo(self.props.charaterIndex).call().then(function(infoRet) {
          self.setState({nickname: infoRet.nickname})
        })

        // Get ipfs data
        self.state.characterRegistry.methods.getCharacterNuja(self.props.charaterIndex).call().then(function(nujaRet) {
          self.state.nujaRegistry.methods.getContract(nujaRet).call().then(function(addressRet) {
            var nujaContract = new self.state.web3.eth.Contract(nujaJson.abi, addressRet)

            nujaContract.methods.getMetadata().call().then(function(ipfsString) {
              ipfs.files.get(ipfsString + '/image.png', function (err, files) {
                self.setState({imageData: "data:image/png;base64,"+imageConverter(files[0].content)})
              })
              ipfs.files.get(ipfsString + '/name/default', function (err, files) {
                self.setState({name: files[0].content.toString('utf8')})
              })
            });
          });

        })
      }
    }
  }

  render() {
    return(
      <div style={infoStyle}>
        <h1>{this.state.nickname}</h1>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-6" style={{}}>
            <img src={this.state.imageData} alt="Nuja" style={{height: '115px'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>{this.state.name}</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Character
