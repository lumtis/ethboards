import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
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


class AllServers extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      serverArray: [],
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
  }

  componentWillMount() {
    var self = this

    if(self.state.account != null) {
      if(self.state.nujaBattle != null) {
        if(self.state.characterRegistry != null) {
          self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {

            for(var i = 0; i < characterNb; i++) {
              self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {
                self.state.characterRegistry.methods.getCharacterCurrentServer(characterIndex).call().then(function(currentServerRet) {
                  if(currentServerRet > 0) {
                    //Get the server infos
                    var currentServer = currentServerRet-1
                    self.state.nujaBattle.methods.getServerInfo(currentServer).call().then(function(infos) {

                      // Change icon depending on server running
                      if (infos.runningRet) {
                        var runIcon = <i class="fas fa-play"></i>
                      }
                      else {
                        runIcon = <i class="fas fa-pause"></i>
                      }

                      var route = '/play/' + toString(this.serverId)

                      // Specifying server button
                      var serverArrayTmp = self.state.serverArray
                      serverArrayTmp.push(
                        <div key={this.serverId} style={infoStyle} className="col-md-12">
                          <Link to={route}>
                            {runIcon}
                            {infos.nameRet}
                            {infos.playerNbRet}
                            {infos.playerMaxRet}
                          </Link>
                        </div>
                      )
                      self.setState({serverArray: serverArrayTmp})
                    }.bind({serverId: currentServer}))
                  }
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

export default AllServers
