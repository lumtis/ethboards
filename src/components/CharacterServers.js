/*
  Get list of servers for the different character of the user
*/

import React, { Component } from 'react'
import { withRouter, BrowserRouter as Router, Link } from 'react-router-dom'
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

class CharacterServers extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverManager: store.getState().web3.serverManagerInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      serverArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
      });
    });
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if(self.state.account != null) {
      if(self.state.nujaBattle != null && self.state.serverManager != null) {
        if(self.state.characterRegistry != null) {
          self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {

            for(var i = 0; i < characterNb; i++) {
              self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {
                self.state.characterRegistry.methods.getCharacterInfo(characterIndex).call().then(function(infoRet) {
                  self.state.serverManager.methods.getCharacterServer(characterIndex).call().then(function(currentServerRet) {
                    if(currentServerRet > 0) {
                      //Get the server infos
                      var currentServer = currentServerRet-1
                      self.state.serverManager.methods.getServerInfo(currentServer).call().then(function(infos) {

                        var route = '/play/' + this.serverId.toString()

                        // Get a random color for background
                        var ranIndex = Math.floor((Math.random() * flatColorList.length))
                        var ranColor = flatColorList[ranIndex]

                        // using withRouter to be able to update the route
                        const ChangeServerComponent = withRouter(({ history }) => (
                          <a style={{cursor: 'pointer'}}
                          onClick={() =>
                            {
                              history.push(route)
                              window.location.reload()
                            }}
                          >
                            <h1>
                              {infoRet.nicknameRet}
                              : {infos.nameRet} (
                              {infos.playerNbRet}/
                              {infos.playerMaxRet})
                            </h1>
                          </a>
                        ))

                        // Specifying server button
                        var serverArrayTmp = self.state.serverArray
                        serverArrayTmp.push(
                          <div key={this.serverId} style={Object.assign({}, chooseStyle, {backgroundColor: ranColor})} className="col-md-12">
                            <ChangeServerComponent />
                          </div>
                        )
                        self.setState({serverArray: serverArrayTmp})
                      }.bind({serverId: currentServer}))
                    }
                  })
                })
              })
            }
          })
        }
      }
    }
  }

  render() {
    return (
      <div className="row">
        {this.state.serverArray}
      </div>
    )
  }
}

export default CharacterServers
