import React, { Component } from 'react'

import BuildingDesc from '../components/BuildingDesc'
import store from '../store'

var SW = require('../utils/stateWrapper')


class Tile extends Component {
  constructor(props) {
    super(props)

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverManager: store.getState().web3.serverManagerInstance,
      buildingCode: 0,
      buildingName: '',
      isHovering: false
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
      })
    })
  }

  static defaultProps = {
    server: 0,
    x: 0,
    y: 0,
    initial: true       // Initial: render initial building state
  }

  componentWillMount() {
    var self = this

    // If we want the initial buidling, we read the smart contract
    if (self.state.nujaBattle != null && self.state.serverManager != null) {
      if(self.props.initial) {
        self.state.serverManager.methods.getServerBuildingWeapon(self.props.server, self.props.x, self.props.y).call().then(function(buildingWeaponRet) {
          self.setState({buildingCode: buildingWeaponRet})
        })
      }
      // Get the name of the building
      self.state.serverManager.methods.getServerBuildingName(self.props.server, self.props.x, self.props.y).call().then(function(buildingNameRet) {
        var buildingNameTmp = store.getState().web3.web3Instance.utils.toAscii(buildingNameRet)
        self.setState({buildingName: buildingNameTmp})
      })
    }

  }

  // Event functions to render description
  handleMouseHover() {
    this.setState({isHovering: true});
  }

  handleMouseLeave() {
    this.setState({isHovering: false});
  }

  render() {
    var offsetX = this.props.x*64
    var offsetY = this.props.y*64
    var desc = <div></div>

    if(this.props.initial) {
      var building = this.state.buildingCode
    }
    else {
      building = SW.getBuilding(this.props.x, this.props.y)
    }

    var field = <img alt="Nuja"></img>

    // If there is a building
    if(building > 0) {

      // If mouse hovering, we show buidling description
      if (this.state.isHovering) {
        desc = <BuildingDesc index={building} name={this.state.buildingName}/>
      }

      field =
      <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
        <img src="/images/tileCity1.png" alt="Nuja" style={{
          width: '64px',
          position: 'absolute',
          top: offsetY+'px',
          left: offsetX+'px'
        }}></img>
        <div style={{
          width: '350px',
          position: 'absolute',
          top: offsetY+100+'px',
          left: offsetX-64+'px'
        }}
        >{desc}</div>
      </div>
    }
    else {

      // Simple field
      field =
      <img src="/images/tile.png" alt="Nuja" style={{
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
    )
  }
}

export default Tile
