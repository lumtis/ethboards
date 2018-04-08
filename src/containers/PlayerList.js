import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import Player from '../components/Player'

import store from '../store'


var noop = function() {};

class PlayerList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      contract: store.getState().web3.contractInstance,
      nb: 0   // TODO: set player of server list instead
    }

    store.subscribe(() => {
      this.setState({
        contract: store.getState().web3.contractInstance,
      });
    });
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this
    if (self.state.contract != null) {
      self.state.contract.methods.getCharacterNb().call().then(function(ret) {
        self.setState({nb: ret})
      });
    }
  }

  // componentDidUpdate() {
  //   var self = this
  //   if (self.state.contract != null) {
  //     self.state.contract.methods.getCharacterNb().call().then(function(ret) {
  //       self.setState({nb: ret})
  //     });
  //   }
  // }

  render() {
    var playerArray = []

    for (var i = 0; i < this.state.nb; i++) {
        playerArray.push(<div key={i} className="col-md-6"><Player index={i}/></div>)
    }

    return (
        <div className="row">
          <div>{playerArray}</div>
        </div>
    );
  }
}

export default PlayerList
