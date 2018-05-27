import React, { Component } from 'react'

import store from '../store'

var SW = require('../utils/stateWrapper')


class Tile extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
    server: 0,
    x: 0,
    y: 0
  }

  componentWillMount() {
  }

  render() {
    var offsetX = this.props.x*64
    var offsetY = this.props.y*64

    var building = SW.getBuilding(this.props.x, this.props.y)

    var field = <img alt="Nuja"></img>
    if(building > 0) {
      field = <img src="/images/tileCity1.png" alt="Nuja" style={{
        width: '64px',
        position: 'absolute',
        top: offsetY+'px',
        left: offsetX+'px'
      }}></img>
    }
    else {
      field = <img src="/images/tile.png" alt="Nuja" style={{
        width: '64px',
        position: 'absolute',
        top: offsetY+'px',
        left: offsetX+'px'
      }}></img>
    }

    return (
      <div>
        {field}
      </div>
    );
  }
}

export default Tile
