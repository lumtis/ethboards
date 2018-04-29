import React, { Component } from 'react'

import PlayerSprite from '../components/PlayerSprite'
import Tile from '../components/Tile'

import store from '../store'


class Map extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      playerArray: [],
      mapName: 'undefined name'
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.getPlayerNb(self.props.server).call().then(function(nb) {

        // For each player, retreive informations
        for (var i = 0; i < nb; i++) {
          self.state.nujaBattle.methods.playerInformation(self.props.server, i).call().then(function(infoPlayer) {

            // Pushing in player array the new player
            var playerArrayTmp = self.state.playerArray
            playerArrayTmp.push(<PlayerSprite key={infoPlayer.characterIndex} index={infoPlayer.characterIndex}/>)
            self.setState({playerArray: playerArrayTmp})
          });
        }
      });
      self.state.nujaBattle.methods.getServerName(self.props.server).call().then(function(name) {
        self.setState({mapName: name})
      });
    }
  }

  render() {
    const rows = 10
    const columns = 10

    var tiles = []

    // Pushing grasses
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
          tiles[rows*i+j] = <Tile key={rows*i+j} server={this.props.server} x={i} y={j} />
      }
    }

    return (
      <div>
        <h1>{this.state.mapName}</h1>
        <div style={{
          height: '640px',
          width: '640px',
          position: 'absolute'
        }}>
          <div>{tiles}</div>
          <div>{this.state.playerArray}</div>
        </div>
      </div>
    );
  }
}

export default Map
