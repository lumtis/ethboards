import React, { Component } from 'react'

import Player from '../components/Player'

import store from '../store'
var SW = require('../utils/stateWrapper')

class PlayerList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverManager: store.getState().web3.serverManagerInstance,
      playerArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.nujaBattle != null && self.state.serverManager != null) {
      self.state.serverManager.methods.getPlayerMax(self.props.server).call().then(function(nb) {
        // For each player, retreive informations
        for (var i = 0; i < nb; i++) {
          self.state.serverManager.methods.playerCharacter(self.props.server, i).call().then(function(characterIndex) {

            // Pushing in player array the new player
            var playerArrayTmp = self.state.playerArray
            playerArrayTmp.push(<div key={characterIndex} className="col-md-6"><Player index={characterIndex}/></div>)
            self.setState({playerArray: playerArrayTmp})
          });
        }
      });
    }
  }

  render() {
    var playerNotDead = []

    for(var i=0; i<this.state.playerArray.length; i++) {
      // Check player is not dead
      if(SW.getPlayerHealth(i) > 0) {
        playerNotDead.push(this.state.playerArray[i])
      }
    }

    return (
        <div className="row">
          <div>{playerNotDead}</div>
        </div>
    );
  }
}

export default PlayerList
