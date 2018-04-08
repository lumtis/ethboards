import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import store from '../store'

var ipfsAPI = require('ipfs-api')


var noop = function() {};

class Player extends Component {
  constructor(props) {
    super(props)

    this.state = {
      contract: store.getState().web3.contractInstance,
      nickname: '',
      health: 0,
      number: 0,
      owner: null,
      imageData: '',
      name: ''
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
          nickname: ret.nameRet,
          health: ret.healthRet,
          number: ret.numberRet,
          owner: ret.ownerRet,
        })

        ipfs.files.get(ret.ipfsRet + '/image.png', function (err, files) {
          self.setState({imageData: "data:image/png;base64,"+converterEngine(files[0].content)})
        })
        ipfs.files.get(ret.ipfsRet + '/name/default', function (err, files) {
          self.setState({name: files[0].content.toString('utf8')})
        })
      });
    }
  }

  render() {
    return (
      <div style={infoStyle}>
        <h1>{this.state.number} - {this.state.nickname}</h1>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-6" style={{}}>
            <img src={this.state.imageData} style={{width: '100%'}}></img>
          </div>
          <div className="col-md-6" style={{}}>
            <p>Name: {this.state.name}</p>
            <p>Health: {this.state.health}</p>
          </div>
        </div>
        <p style={{fontSize: '10px'}}>{this.state.owner}</p>
      </div>
    );
  }
}

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  boxShadow:'5px 5px rgba(0, 0, 0, 1)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};

export default Player
