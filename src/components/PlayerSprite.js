import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import Player from '../components/Player'
import store from '../store'

var ipfsAPI = require('ipfs-api')

var noop = function() {};

class PlayerSprite extends Component {
  constructor(props) {
    super(props)

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      contract: store.getState().web3.contractInstance,
      positionX: 0,
      positionY: 0,
      isHovering: false,
      imageDate: ''
    }

    store.subscribe(() => {
      this.setState({
        contract: store.getState().web3.contractInstance,
      });
    });
  }

  static defaultProps = {
    index: 0
  }

  componentWillMount() {
    var self = this
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    var converterEngine = function (input) { // fn BLOB => Binary => Base64 ?
        var uInt8Array = new Uint8Array(input),
              i = uInt8Array.length;
        var biStr = []; //new Array(i);
        while (i--) { biStr[i] = String.fromCharCode(uInt8Array[i]);  }
        var base64 = window.btoa(biStr.join(''));
        return base64;
    };


    if (self.state.contract != null) {
      self.state.contract.methods.getPlayerInfo(self.props.index).call().then(function(ret) {
        self.setState({
          positionX: ret.positionXRet,
          positionY: ret.positionYRet,
        })

        ipfs.files.get(ret.ipfsRet + '/sprite.gif', function (err, files) {
          self.setState({imageData: "data:image/gif;base64,"+converterEngine(files[0].content)})
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
