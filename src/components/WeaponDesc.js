import React, { Component } from 'react'
import store from '../store'

var weaponJson = require('../../build/contracts/Weapon.json')
import ipfsGet from '../utils/ipfsGet'

import imageConverter from '../utils/imageConverter'


const infoStyle = {
  padding: '20px',
  width: '400px',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
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
      imageLink: '',
      name: '',
      power: ''
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

    if (self.state.weaponRegistry != null) {

      // Get the contract address
      self.state.weaponRegistry.methods.getContract(this.props.weaponIndex).call().then(function(addressRet) {
        var weaponContract = new self.state.web3.eth.Contract(weaponJson.abi, addressRet)

        if (weaponContract != null) {
          weaponContract.methods.getMetadata().call().then(function(ret) {
            self.setState({imageLink: 'https://ipfs.infura.io' + ret + '/image.png'})
            ipfsGet(ret + '/name/default', function(response) {
              self.setState({name: response.toString('utf8')})
            })
            ipfsGet(ret + '/power/default', function(response) {
              self.setState({power: response.toString('utf8')})
            })
          });
        }
      })
    }
  }

  render() {
    return (
      <div style={infoStyle}>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-6" style={{}}>
            <img src={this.state.imageLink} alt="Nuja" style={{width: '100px'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>{this.state.name}</p>
            <p>{this.state.power}</p>
          </div>
        </div>
      </div>
    );
  }
}


export default WeaponDesc
