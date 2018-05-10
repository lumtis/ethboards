import React, { Component } from 'react'
import store from '../store'

var ipfsAPI = require('ipfs-api')
var weaponJson = require('../../build/contracts/Weapon.json')

import imageConverter from '../utils/imageConverter'


const infoStyle = {
  padding: '20px',
  width: '400px',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.9)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px',
  zIndex: 1000
};

class WeaponDesc extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: store.getState().web3.web3Instance,
      weaponRegistry: store.getState().web3.weaponRegistryInstance,
      imageData: '',
      name: '',
      description: ''
    }

    store.subscribe(() => {
      this.setState({
        web3: store.getState().web3.web3Instance,
        weaponRegistry: store.getState().web3.weaponRegistryInstance,
      });
    });
  }

  static defaultProps = {
    weaponIndex: 0
  }

  componentWillMount() {
    var self = this
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    if (weaponRegistry != null) {
      if (weaponContract != null) {

        // Get the contract address
        self.state.weaponRegistry.methods.getContract(this.props.weaponIndex).call().then(function(addressRet) {
          var weaponContract = new self.state.web3.eth.Contract(weaponJson.abi, addressRet)
          weaponContract.methods.getMetadata().call().then(function(ret) {
            ipfs.files.get(ret + '/image.png', function (err, files) {
              self.setState({imageData: "data:image/png;base64,"+imageConverter(files[0].content)})
            })
            ipfs.files.get(ret + '/name/default', function (err, files) {
              self.setState({name: files[0].content.toString('utf8')})
            })
            ipfs.files.get(ret + '/description/default', function (err, files) {
              self.setState({description: files[0].content.toString('utf8')})
            })
          });
        }
      }
    }
  }

  render() {
    return (
      <div style={infoStyle}>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-6" style={{}}>
            <img src={this.state.imageData} alt="Nuja" style={{width: '100px'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>{this.state.name}</p>
            <p>{this.state.description}</p>
          </div>
        </div>
      </div>
    );
  }
}


export default WeaponDesc
