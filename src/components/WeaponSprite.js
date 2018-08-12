import React, { Component } from 'react'
import store from '../store'

var weaponJson = require('../../build/contracts/Weapon.json')

import WeaponDesc from '../components/WeaponDesc'

import ipfsGet from '../utils/ipfsGet'

class DescSpawner extends Component {
  constructor(props) {
    super(props)
  }

  static defaultProps = {
    weaponIndex: 0
  }

  render() {
    var desc = <WeaponDesc weaponIndex={this.props.weaponIndex} />

    return (
      <div style={{
        top: '10px',
        left: '10px',
        position: 'fixed',
        width: '350px',
      }}
      >{desc}</div>
    );
  }
}

class WeaponSprite extends Component {
  constructor(props) {
    super(props)

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      web3: store.getState().web3.web3Instance,
      weaponRegistry: store.getState().web3.weaponRegistryInstance,
      imageLink: '',
      isHovering: false,
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
          });
        }
      })
    }
  }

  handleMouseHover() {
    this.setState({isHovering: true});
  }

  handleMouseLeave() {
    this.setState({isHovering: false});
  }

  render() {
    if (this.state.isHovering) {
      return (
        <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
          <img src={this.state.imageLink} alt="Nuja" style={{width:'100%'}}></img>
          <DescSpawner weaponIndex={this.props.weaponIndex} />
        </div>
      );
    }
    else {
      return (
        <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
          <img src={this.state.imageLink} alt="Nuja" style={{width:'100%'}}></img>
        </div>
      );
    }
  }
}


export default WeaponSprite
