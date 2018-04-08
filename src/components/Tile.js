import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import store from '../store'


var noop = function() {};

class Tile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      building: 0,
      contract: store.getState().web3.contractInstance
    }

    store.subscribe(() => {
      this.setState({
        contract: store.getState().web3.contractInstance
      });
    });
  }

  static defaultProps = {
    x: 0,
    y: 0
  }

  componentWillMount() {
    var self = this

    if (self.state.contract != null) {
      self.state.contract.methods.getField(self.props.x, self.props.y).call().then(function(ret) {
        self.setState({building: ret.buildingRet})
      });
    }
    else {
      self.setState({building: 0})
    }
  }

  // componentDidUpdate() {
  //   var self = this
  //
  //   console.log('test')
  //
  //   if (self.state.contract != null) {
  //     self.state.contract.methods.getField(self.props.x, self.props.y).call().then(function(ret) {
  //       self.setState({building: ret.buildingRet})
  //     });
  //   }
  //   else {
  //     self.setState({building: 0})
  //   }
  // }

  render() {
    var offsetX = this.props.x*64
    var offsetY = this.props.y*64

    var field = <img></img>
    if(this.state.building > 0) {
      field = <img src="/images/tileCity1.png" style={{
        width: '64px',
        position: 'absolute',
        top: offsetY+'px',
        left: offsetX+'px'
      }}></img>
    }
    else {
      field = <img src="/images/tile.png" style={{
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
