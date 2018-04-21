import React, { Component } from 'react'
import store from '../store'

var ipfsAPI = require('ipfs-api')

var noop = function() {};

class WeaponList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }
}

export default WeaponList
