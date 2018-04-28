import React, { Component } from 'react'

import store from '../store'

class Tile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      building: 0,
      nujaBattle: store.getState().web3.nujaBattleInstance,
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }

  static defaultProps = {
    server: 0,
    x: 0,
    y: 0
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.fieldInformation(self.props.server, self.props.x, self.props.y).call().then(function(ret) {
        self.setState({building: ret.buildingRet})
      });
    }
  }

  render() {
    var offsetX = this.props.x*64
    var offsetY = this.props.y*64

    var field = <img alt="Nuja"></img>
    if(this.state.building > 0) {
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
