import React, { Component } from 'react'
import store from '../store'
import WeaponDesc from '../components/WeaponDesc'
import Bar from '../components/Bar'

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};


class WeaponPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      weaponRegistry: store.getState().web3.weaponRegistryInstance,
      weaponArray: [],
    }

    store.subscribe(() => {
      this.setState({
        weaponRegistry: store.getState().web3.weaponRegistryInstance,
      })
    })
  }

  componentWillMount() {
    var self = this

    if (self.state.weaponRegistry != null) {
      self.state.weaponRegistry.methods.getWeaponNumber().call().then(function(weaponNb) {
        for (var i = 0; i < weaponNb; i++) {
          // Add nuja
          var weaponArrayTmp = self.state.weaponArray
          weaponArrayTmp.push(
            <div key={i} className="col-md-12">
              <WeaponDesc weaponIndex={i} />
            </div>
          )
          self.setState({weaponArray: weaponArrayTmp})
        }
      })
    }
  }

  render() {
    // Informations about weapons
    var infoWeapon =
      <div style={infoStyle}>
        <h1>Weapon</h1>
        <p>Weapons are special items that can be used during a match. Weapons can be found inside buildings.</p>
      </div>

    return(
      <div>
        <Bar style={{paddingRight:'10px'}} />
        <div style={{marginTop:'30px'}} className="row">
          <div className="col-md-6" style={{}}>
           {infoWeapon}
          </div>
          <div className="col-md-6" style={{}}>
            <div className="row">
              {this.state.weaponArray}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WeaponPage
