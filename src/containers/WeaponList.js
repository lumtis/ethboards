import React, { Component } from 'react'
import store from '../store'

import WeaponSprite from '../components/WeaponSprite'

class WeaponList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      weaponArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }

  static defaultProps = {
    server: 0,
    player: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.playerInformation(self.props.server, self.props.player).call().then(function(playerInfo) {
        // For each weapon, retreive id
        for (var i = 0; i < playerInfo.weaponNumber; i++) {
          self.state.nujaBattle.methods.playerWeapons(self.props.server, self.props.player, i).call().then(function(weaponId) {

            self.state.nujaBattle.methods.getWeaponAddress(self.props.server, weaponId).call().then(function(weaponAddress) {
              var weaponArrayTmp = self.state.weaponArray
              weaponArrayTmp.push(<div key={this.userWeaponId} className="col-md-3"><WeaponSprite contractAddress={weaponAddress}/></div>)
              self.setState({weaponArray: weaponArrayTmp})
            }.bind(this));
          }.bind({userWeaponId: i}));
        }
      });
    }
  }

  render() {
    return (
        <div className="row">
          <div>{this.state.weaponArray}</div>
        </div>
    );
  }
}

export default WeaponList
