import React, { Component } from 'react'
import store from '../store'

import WeaponSprite from '../components/WeaponSprite'

var SW = require('../utils/stateWrapper')


class WeaponList extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
    server: 0,
    player: 0
  }

  componentWillMount() {
  }

  render() {
    var weaponArray = []
    var weapons = SW.getPlayerWeapons(this.props.player)

    for (var i = 0; i < weapons.length; i++) {
      weaponArray.push(<div key={i} className="col-md-3"><WeaponSprite weaponIndex={weapons[i]}/></div>)
    }

    return (
      <div className="row">
        <div>{this.state.weaponArray}</div>
      </div>
    );
  }
}

export default WeaponList
