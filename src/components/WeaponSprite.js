import React, { Component } from 'react'
import store from '../store'
import ReactCursorPosition from 'react-cursor-position'

var ipfsAPI = require('ipfs-api')
var weaponJson = require('../../build/contracts/Weapon.json')

import WeaponDesc from '../components/WeaponDesc'

import imageConverter from '../utils/imageConverter'



class DescSpawner extends Component {
  constructor(props) {
    super(props)
  }

  static defaultProps = {
    contractAddress: null
  }

  render() {
    var desc = <WeaponDesc contractAddress={this.props.contractAddress} />

    return (
      <div style={{
        // top: this.props.position.y-100+'px',   TODO: Maybe change this ?
        // left: this.props.position.x+100+'px',
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
      imageData: '',
      isHovering: false,
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
    var self = this
    var weaponContract = new self.state.web3.eth.Contract(weaponJson.abi, this.props.contractAddress)
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    if (weaponContract != null) {
      weaponContract.methods.getMetadata().call().then(function(ret) {
        ipfs.files.get(ret + '/image.png', function (err, files) {
          self.setState({imageData: "data:image/png;base64,"+imageConverter(files[0].content)})
        })
      });
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
          <img src={this.state.imageData} alt="Nuja" style={{width:'100%'}}></img>
            <DescSpawner contractAddress={this.props.contractAddress} />

        </div>
      );
    }
    else {
      return (
        <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
          <img src={this.state.imageData} alt="Nuja" style={{width:'100%'}}></img>
        </div>
      );
    }
  }
}

// <ReactCursorPosition>
// </ReactCursorPosition>

export default WeaponSprite
