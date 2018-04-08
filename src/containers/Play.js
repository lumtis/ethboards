import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import store from '../store'

import Footer from '../components/Footer'
import Bar from '../components/Bar'
import Map from '../containers/Map'
import Sidebar from '../containers/Sidebar'
import PlayerList from '../containers/PlayerList'

var noop = function() {};


class Play extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
    var web3 = store.getState().web3.web3Instance

    web3.eth.getAccounts(function(err, accounts) {
      if (accounts.length > 0) {
        var account = {"address":accounts[0], "privateKey":""}
        store.dispatch({type: 'ACCOUNT_LOGIN', payload: {accountInstance: account}})
      }
    })
  }

  render() {
    return (
      <div>
        <div className="col-md-4" style={{paddingLeft:0, paddingRight:0}}>
          <Sidebar />
        </div>
        <div className="col-md-8" style={{paddingRight:0, paddingLeft:0}}>

          <div className="container-fluid" style={{overflowY: 'scroll', height: '100vh', paddingLeft:0, paddingRight:0}}>
            <Bar style={{paddingRight:'10px'}} />
            <div className="row" style={{padding: '30px'}}>
              <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
                <h1>Map Name</h1>
                <Map />
              </div>
              <div className="col-md-12" style={{width:'100%', top:'660px'}}>
                <h1 style={{marginBottom: '40px'}}>Other players :</h1>
                <PlayerList />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Play
