import React, { Component } from 'react'
import store from '../store'
import ReactCursorPosition from 'react-cursor-position'

var ipfsAPI = require('ipfs-api')
var weaponJson = require('../../build/contracts/Weapon.json')

import WeaponDesc from '../components/WeaponDesc'

import imageConverter from '../utils/imageConverter'

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
    var weaponContract = new self.state.web3.eth.Contract(weaponJson.abi, this.props.contractAddress)
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    if (weaponContract != null) {
      weaponContract.methods.getMetadata().call().then(function(ret) {
        ipfs.files.get(ret + '/sprite.gif', function (err, files) {
          self.setState({imageData: "data:image/gif;base64,"+imageConverter(files[0].content)})
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
    var desc = <div></div>

    if (this.state.isHovering) {
      desc = <WeaponDesc contractAddress={this.props.contractAddress} />
    }

    return (
      <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
        <img src={this.state.imageData} alt="Nuja"></img>
        <ReactCursorPosition>
          <div style={{
            top: this.props.position.y-100+'px',
            left: this.props.position.x+'px',
            width: '350px',
            position: 'absolute'
          }}
          >{desc}</div>
        </ReactCursorPosition>
      </div>
    );
  }
}

export default WeaponSprite
