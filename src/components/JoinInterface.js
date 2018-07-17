import React, { Component } from 'react'
import store from '../store'


var flatColorList = [
  '#55efc4',
  '#74b9ff',
  '#a29bfe',
  '#fab1a0',
  '#b2bec3',
  '#ffeaa7'
]

const chooseStyle = {
  position: 'relative',
  width: '100%',
  height: '65px',
};


class JoinInterface extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverManager: store.getState().web3.serverManagerInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      characterArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
        serverFee: 0,
        serverMoneyBag: 0,
        cheatWarrant: 0,
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this

    if(self.state.account != null) {
      if (this.state.nujaBattle != null) {
        if(self.state.characterRegistry != null) {
          self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {

            for(var i = 0; i < characterNb; i++) {
              self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {
                self.state.characterRegistry.methods.getCharacterInfo(characterIndex).call().then(function(infoRet) {
                  self.state.serverManager.methods.getCharacterServer(characterIndex).call().then(function(currentServerRet) {
                    if(currentServerRet == 0) {

                      // Get a random color for background
                      var ranIndex = Math.floor((Math.random() * flatColorList.length))
                      var ranColor = flatColorList[ranIndex]

                      // Specifying server button
                      var characterArrayTmp = self.state.characterArray
                      characterArrayTmp.push(
                        <div key={this.characterIndex} style={Object.assign({}, chooseStyle, {backgroundColor: ranColor})} className="col-md-12">
                          <a style={{cursor: 'pointer'}} onClick={self.joinServer(this.characterIndex)}>
                            <h1>{infoRet.nicknameRet}</h1>
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

        // Get server financial infos
        self.state.nujaBattle.methods.getServerFinancial(this.props.server).call().then(function(financial) {
            self.setState({serverFee: financial.feeRet, serverMoneyBag: financial.moneyBagRet})
        })

        // Get contract cheat warrant
        self.state.serverManager.methods.getCheatWarrant().call().then(function(cheatWarrant) {
            self.setState({cheatWarrant: cheatWarrant})
        })
      }
    }
  }

  joinServer(characterId) {
    return function(e) {
      // Join the server
      if (this.state.nujaBattle != null) {
        this.state.serverManager.methods.addPlayerToServer(characterId, this.props.server).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
          value: parseInt(this.state.serverFee) + parseInt(this.state.serverMoneyBag) + parseInt(this.state.cheatWarrant)
          }
        )
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

  render() {
    return (
      <div>
        <h3 style={{marginTop: '30px'}}>Join the server :</h3>
        <h3 style={{fontSize: '12px'}}>Fee : {this.state.serverFee/1000000000000000000} ETH</h3>
        <h3 style={{fontSize: '12px'}}>Money Bag : {this.state.serverMoneyBag/1000000000000000000} ETH</h3>
        <h3 style={{fontSize: '12px'}}>Cheat Warrant : {this.state.cheatWarrant/1000000000000000000} ETH</h3>
        <div style={{marginTop: '20px'}} className="row">
          {this.state.characterArray}
        </div>
      </div>
    )
  }
}

export default JoinInterface
