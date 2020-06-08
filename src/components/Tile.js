import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"

import store from '../store'
import { getPawnAt } from '../utils/stateUtils'

import PawnSprite from '../components/PawnSprite'
import Cross from '../components/Cross'

class Tile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      boardState: store.getState().game.boardState,
      gameId: store.getState().game.gameId,
      crosses: store.getState().game.crosses,
    }

    store.subscribe(() => {
      this.setState({
        boardState: store.getState().game.boardState,
        gameId: store.getState().game.gameId,
        crosses: store.getState().game.crosses,
      })
    })
  }

  static defaultProps = {
    x: 0,
    y: 0,
  }

  render() {
    const {x, y} = this.props
    const {boardState, crosses} = this.state
    const offsetX = x*64
    const offsetY = y*64

    // Determine if a cross must be drawn
    let cross = null
    if (crosses[x*8+y]) {
      cross = <Cross x={offsetX} y={offsetY} />
    }    

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
        {cross}
      </div>
    )
  }
}

export default Tile
