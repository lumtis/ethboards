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
      <div>
        <h1>{this.state.mapName}</h1>
        <div style={{
          height: '95vw',
          width: '95vw',
          maxWidth: '524px',
          maxHeight: '524px',
          position: 'relative',
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
