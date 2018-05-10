import React, { Component } from 'react'
import store from '../store'

/*
  Get list of servers for the different character of the user
*/

var flatColorList = [
  '#55efc4',
  '#74b9ff',
  '#a29bfe',
  '#fab1a0',
  '#b2bec3',
  '#ffeaa7'
]

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


class JoinInterface extends Component {
  constructor(props) {
    super(props)

    this.joinServer = this.joinServer.bind(this)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      characterArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
      });
    });
  }

  static defaultProps = {
    server: 0
  }


  joinServer(characterId) {
    return function(e) {
      // Join the server
      if (this.state.nujaBattle != null) {
        this.state.nujaBattle.methods.addPlayerToServer(characterId, this.props.server).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server joined')
        });
      }
    }.bind(this)
  }

  componentWillMount() {
    var self = this

    if(self.state.account != null) {
      if(self.state.characterRegistry != null) {
        self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {

          for(var i = 0; i < characterNb; i++) {
            self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {
              self.state.characterRegistry.methods.getCharacterInfo(characterIndex).call().then(function(infoRet) {
                self.state.characterRegistry.methods.getCharacterCurrentServer(characterIndex).call().then(function(currentServerRet) {
                  if(currentServerRet == 0) {

                    // Specifying server button
                    var characterArrayTmp = self.state.characterArray
                    characterArrayTmp.push(
                      <div key={this.characterIndex} style={infoStyle} className="col-md-12">
                        <a onClick={self.joinServer(this.characterIndex)}>
                          {infoRet.nicknameRet}
                        </a>
                      </div>
                    )
                    self.setState({characterArray: characterArrayTmp})
                  }
                }.bind({characterIndex: this.characterIndex}))
              }.bind({characterIndex: characterIndex}))
            })
          }
        })
      }
    }
  }

  render() {
    return (
      <div className="row">
        {this.state.characterArray}
      </div>
    )
  }
}

export default JoinInterface
