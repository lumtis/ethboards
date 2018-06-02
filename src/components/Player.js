import React, { Component } from 'react'

import WeaponSprite from '../components/WeaponSprite'

import store from '../store'
import imageConverter from '../utils/imageConverter'

var ipfsAPI = require('ipfs-api')
var nujaJson = require('../../build/contracts/Nuja.json')
var SW = require('../utils/stateWrapper')

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};

class Player extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: store.getState().account.accountInstance,
      web3: store.getState().web3.web3Instance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      nujaRegistry: store.getState().web3.nujaRegistryInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      nickname: '',     // Character info
      owner: null,
      server: 0,
      number: 0,
      imageData: '',    // Nuja info
      name: ''
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance,
        web3: store.getState().web3.web3Instance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        nujaRegistry: store.getState().web3.nujaRegistryInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
      });
    });
  }

  static defaultProps = {
    index: 0,
  }

  componentWillMount() {
    var self = this
    var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    if (self.state.nujaBattle != null) {
      if (self.state.characterRegistry != null) {
        self.state.characterRegistry.methods.getCharacterInfo(self.props.index).call().then(function(characterInfo) {

          self.state.nujaBattle.methods.getCharacterServer(self.props.index).call().then(function(currentServerRet) {

            // Check if is currently in a server
            if(currentServerRet > 0) {

              var currentServer = currentServerRet-1

              // Update character infos
              self.setState({
                nickname: characterInfo.nicknameRet,
                owner: characterInfo.ownerRet,
                server: currentServer,
              })

              // Retrieve server info

              if (self.state.account != null) {
                self.state.nujaBattle.methods.getIndexFromAddress(currentServer, characterInfo.ownerRet).call().then(function(playerIndex) {
                  self.state.nujaBattle.methods.playerInformation(currentServer, playerIndex).call().then(function(playerInfo) {
                    // Update server infos
                    self.setState({
                      number: playerIndex,
                    })
                  });
                });
              }

              // Retrieve nuja info
              self.state.characterRegistry.methods.getCharacterNuja(self.props.index).call().then(function(characterNuja) {
                if (self.state.nujaRegistry != null) {
                  self.state.nujaRegistry.methods.getContract(characterNuja).call().then(function(addressRet) {
                    var nujaContract = new self.state.web3.eth.Contract(nujaJson.abi, addressRet)

                    nujaContract.methods.getMetadata().call().then(function(ipfsString) {
                      ipfs.files.get(ipfsString + '/image.png', function (err, files) {
                        self.setState({imageData: "data:image/png;base64,"+imageConverter(files[0].content)})
                      })
                      ipfs.files.get(ipfsString + '/name/default', function (err, files) {
                        self.setState({name: files[0].content.toString('utf8')})
                      })
                    })
                  })
                }
              })

            }
          })
        })
      }
    }
  }

  render() {
    var health = SW.getPlayerHealth(this.state.number)

    var weaponArray = []
    var weapons = SW.getPlayerWeapons(this.props.player)

    for (var i = 0; i < weapons.length; i++) {
      weaponArray.push(<div key={i} className="col-md-3"><WeaponSprite weaponIndex={weapons[i]}/></div>)
    }
    var weaponList =
      <div className="row">
        <div>{weaponArray}</div>
      </div>

    // If player is dead, we render nothing
    if(health == 0) {
      return(null)
    }
    else {
      return (
        <div style={infoStyle}>
          <h1>{this.state.number} - {this.state.nickname}</h1>
          <div className="row" style={{padding: '10px'}}>
            <div className="col-md-6">
              <img src={this.state.imageData} alt="Nuja" style={{height: '115px'}}></img>
            </div>
            <div className="col-md-6">
              <p>{this.state.name}</p>
              <p>Health: {health}</p>
            </div>
          </div>
          <p style={{fontSize: '10px'}}>{this.state.owner}</p>
          {weaponList}
        </div>
      );
    }
  }
}


export default Player
