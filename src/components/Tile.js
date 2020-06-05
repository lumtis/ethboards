import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"

import store from '../store'
import { getPawnType, getPawnAt } from '../utlis/stateUtils'

import PawnSprite from '../components/PawnSprite'

class Tile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      boardState: store.getState().game.boardState,
    }

    store.subscribe(() => {
      this.setState({
        boardState: store.getState().game.boardState,
      })
    })
  }

  static defaultProps = {
    x: 0,
    y: 0,
  }

  render() {
    const {x, y} = this.props
    const {boardState} = this.state
    const offsetX = x*64
    const offsetY = y*64

    // Get the image to show for the cell
    let imageFile = "/assets/board/greycell.png"
    if (((this.props.x+this.props.y) % 2) === 0) {
        imageFile = "/assets/board/whitecell.png"
    }

    // Check if a pawn is present in the cell
    let pawnSprite = null
    const pawn = getPawnAt(boardState, x, y)
    if (pawn !== -1) {
      pawnSprite = <DrizzleContext.Consumer>
        { drizzleContext => {
            return <PawnSprite pawn={pawn} x={offsetX} y={offsetY} drizzleContext={drizzleContext}/>
        }}
      </DrizzleContext.Consumer>
    }

    const cell = <img src={imageFile} alt="Cell" style={{
      width: '64px',
      position: 'absolute',
      top: offsetY+'px',
      left: offsetX+'px'
    }}></img>

    return (
      <div>
        {cell}
        {pawnSprite}
      </div>
    )
  }
}

export default Tile
