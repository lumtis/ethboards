import React, { Component } from 'react'

import Tile from '../components/Tile'

import store from '../store'
import '../css/map.css'


class MapInitial extends Component {
  constructor(props) {
    super(props)


    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      mapName: 'undefined name',
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      })
    })
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.getServerName(self.props.server).call().then(function(name) {
        self.setState({mapName: name})
      })
    }
  }


  render() {
    const rows = 8
    const columns = 8

    var tiles = []

    // Tilemap
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
          tiles[rows*i+j] = <Tile key={rows*i+j} server={this.props.server} x={i} y={j} initial={true} />
      }
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
        </div>
      </div>
    )
  }
}

export default MapInitial
