import React, { Component } from 'react'

import WeaponSprite from '../components/WeaponSprite'


var prefixList = [
  'Dra',
  'Cro',
  'Li',
  'Blu',
  'Re',
  'Fre',
  'Fla',
  'Col'
]

var suffixList = [
  'da',
  'mar',
  'land',
  'dya',
  'co',
  'kir',
  'meck',
  'mir'
]

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(162, 155, 254, 0.9)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px',
  zIndex: 100
};


class BuildingDesc extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
    index: 0,
    x: 0,
    y: 0
  }

  render() {
    var buidlingName = prefixList[this.props.x] + suffixList[this.props.y]

    if(this.props.index == 0) {
      return(null)
    }
    else {
      if(this.props.index == 1) {
        var weaponDesc = <h3>No weapon</h3>
      }
      else {
        weaponDesc =
        <div>
          <h3>Weapon:</h3>
          <WeaponSprite weaponIndex={this.props.index - 2}/>
        </div>
      }

      return (
        <div style={infoStyle}>
          <h1>{buidlingName}</h1>
          <div className="row" style={{padding: '10px'}}>
            <div className="col-md-6">
              <img src="/images/tileCity1.png" alt="Nuja" style={{
                width: '80%',
                position: 'absolute',
              }}></img>
            </div>
            <div className="col-md-6">
              {weaponDesc}
            </div>
          </div>
        </div>
      )
    }
  }
}

export default BuildingDesc
