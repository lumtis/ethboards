import React, { Component } from 'react'
import store from '../store'

var ipfsAPI = require('ipfs-api')
var weaponJson = require('../../build/contracts/Weapon.json')

import imageConverter from '../utils/imageConverter'
var noop = function() {};

class WeaponSprite extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: store.getState().web3.web3Instance,
      imageData: '',
    }

    store.subscribe(() => {
      this.setState({
        web3: store.getState().web3.web3Instance,
      });
    });
  }

  static defaultProps = {
    contractAddress: null
  }

  componentWillMount() {
    var weaponContract = new self.state.web3.eth.Contract(weaponJson.abi, this.props.contractAddress)

    if (weaponContract != null) {
      weaponContract.methods.getMetadata().call().then(function(ret) {
        ipfs.files.get(ret + '/sprite.gif', function (err, files) {
          self.setState({imageData: "data:image/gif;base64,"+imageConverter(files[0].content)})
        })
      });
    }
  }

  render() {
    return (
    );
  }
}

export default WeaponSprite
