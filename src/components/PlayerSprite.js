import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import Player from '../components/Player'
import store from '../store'
import imageConverter from '../utils/imageConverter'

var ipfsAPI = require('ipfs-api')
var nujaJson = require('../../build/contracts/Nuja.json')

var noop = function() {};

class PlayerSprite extends Component {
  constructor(props) {
    super(props)

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      web3: store.getState().web3.web3Instance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      nujaRegistry: store.getState().web3.nujaRegistryInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      positionX: 0,
      positionY: 0,
      imageData: '',
      isHovering: false
    }

    store.subscribe(() => {
      this.setState({
        web3: store.getState().web3.web3Instance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        nujaRegistry: store.getState().web3.nujaRegistryInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
      });
    });
  }

  static defaultProps = {
    index: 0
  }

  componentWillMount() {
    var self = this
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')


    if (self.state.characterRegistry != null) {
      self.state.characterRegistry.methods.getCharacterInfo(self.props.index).call().then(function(ret) {
        // Retrieve server info
        if (self.state.nujaBattle != null) {
          self.state.nujaBattle.methods.getIndexFromAddress(ret.currentServerRet, self.state.account.address).call().then(function(playerIndex) {
            self.state.nujaBattle.methods.playerInformation(ret.currentServerRet, playerIndex).call().then(function(playerInfo) {
              // Update server infos
              self.setState({
                positionX: playerInfo.positionX,
                positionY: playerInfo.positionY,
              })
            });
          });
        }

        // Retrieve nuja info
        if (self.state.nujaRegistry != null) {
          self.state.nujaRegistry.methods.getContract(ret.nujaRet).call().then(function(addressRet) {
            var nujaContract = new self.state.web3.eth.Contract(nujaJson.abi, addressRet)
            nujaContract.methods.getMetadata().call().then(function(ipfsString) {
              ipfs.files.get(ipfsString + '/sprite.gif', function (err, files) {
                self.setState({imageData: "data:image/gif;base64,"+imageConverter(files[0].content)})
              })
            });
          }
        }
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
    var offsetX = this.state.positionX*64+15
    var offsetY = this.state.positionY*64+15
    var desc = <div></div>

    if (this.state.isHovering) {
      desc = <Player index={this.props.index} />
    }

    return (
      <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
        <img src={this.state.imageData} style={{
          width: '32px',
          position: 'absolute',
          top: offsetY+'px',
          left: offsetX+'px'
        }}></img>
        <div style={{
          top: offsetY-100+'px',
          left: offsetX+'px',
          width: '350px',
          position: 'absolute'
        }}
        >{desc}</div>
      </div>
    );
  }
}

export default PlayerSprite
