import React, { Component } from 'react'

import Tile from '../components/Tile'

// Graphical representation of a board
class Board extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    const rows = 8
    const columns = 8
    let tiles = []

    // Tilemap
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
        tiles[rows*i+j] = <Tile key={rows*i+j} x={i} y={j} />
      }
    }

    return(
      <div style={{marginLeft: '60px'}}>
        <h1>{this.state.mapName}</h1>
        <div style={{
          marginLeft: '50px',
          height: '522px',
          width: '522px',
          position: 'absolute',
          borderStyle: 'solid',
          borderWidth: '5px',
          borderColor: '#222831'
        }}>
          <div>{tiles}</div>
        </div>
      </div>
    )
  }
}

export default Board
