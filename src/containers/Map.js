import React, { Component } from 'react'

import PlayerSprite from '../components/PlayerSprite'
import Tile from '../components/Tile'

import store from '../store'
import '../css/map.css'

var PubSub = require('pubsub-js')

class Map extends Component {
  constructor(props) {
    super(props)

    this.crossPressed = this.crossPressed.bind(this);
    this.getMessage = this.getMessage.bind(this);

    var token = PubSub.subscribe('CROSSES', this.getMessage);

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      playerArray: [],
      crossArray: [],
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
          self.state.nujaBattle.methods.playerCharacter(self.props.server, i).call().then(function(characterIndex) {

            // Pushing in player array the new player
            var playerArrayTmp = self.state.playerArray
            playerArrayTmp.push(<PlayerSprite key={characterIndex} index={characterIndex}/>)
            self.setState({playerArray: playerArrayTmp})
          });
        }
      });
      self.state.nujaBattle.methods.getServerName(self.props.server).call().then(function(name) {
        self.setState({mapName: name})
      });
    }
  }

  // Add a cross on the map
  addCross(x, y) {
    var crossArrayTmp = this.state.crossArray
    crossArrayTmp.push({x: x, y: y})
    this.setState({crossArray: crossArrayTmp})
  }

  // Remove all crosses from map
  removeAllCrosses() {
    this.setState({crossArray: []})
  }

  // Event function when cross is pushed
  crossPressed(x, y) {
    return function(e) {
      PubSub.publish('CROSSES', 'pressed ' + x + ' ' + y);
    }
  }

  // Get message from action component
  getMessage(msg, data) {
    var dataArray = data.split(' ')

    // Remove message
    if(dataArray[0] == 'remove') {
      this.removeAllCrosses()
    }
    else if(dataArray[0] == 'add') {
      this.addCross(parseInt(dataArray[1]), parseInt(dataArray[2]))
    }
  }

  render() {
    const rows = 10
    const columns = 10

    var tiles = []
    var crosses = []

    // Tilemap
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
          tiles[rows*i+j] = <Tile key={rows*i+j} server={this.props.server} x={i} y={j} />
      }
    }

    // crosses
    for (i = 0; i < this.state.crossArray.length; i++) {
      var offsetX = this.state.crossArray[i].x*64
      var offsetY = this.state.crossArray[i].y*64
      crosses.push(
        <button
          key={i}
          onClick={this.crossPressed(this.state.crossArray[i].x, this.state.crossArray[i].y)}
          className="cross" style={{
            width: '64px',
            position: 'absolute',
            top: offsetY+'px',
            left: offsetX+'px'
          }}
        ><i className="fa fa-times"></i></button>)
    }

    return (
      <div style={{marginLeft: '60px'}}>
        <h1>{this.state.mapName}</h1>
        <div style={{
          height: '640px',
          width: '640px',
          position: 'absolute'
        }}>
          <div>{tiles}</div>
          <div>{this.state.playerArray}</div>
          <div>{crosses}</div>
        </div>
      </div>
    );
  }
}

export default Map
