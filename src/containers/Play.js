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

    this.changeServer = this.changeServer.bind(this, 'id');

    this.state = {
      server: 0
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

  changeServer(id, e) {
    e.preventDefault();
    var self = this;

    self.setState({server: id})
  }

  render() {
    return (
      <div>
        <div className="col-md-4" style={{paddingLeft:0, paddingRight:0}}>
          <Sidebar server={this.state.server} onChangeServer={this.changeServer.bind(this, 'id')} />
        </div>
        <div className="col-md-8" style={{paddingRight:0, paddingLeft:0}}>

          <div className="container-fluid" style={{overflowY: 'scroll', height: '100vh', paddingLeft:0, paddingRight:0}}>
            <Bar style={{paddingRight:'10px'}} />
            <div className="row" style={{padding: '30px'}}>
              <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
                <Map server={this.state.server} />
              </div>
              <div className="col-md-12" style={{width:'100%', top:'660px'}}>
                <h1 style={{marginBottom: '40px'}}>Other players :</h1>
                <PlayerList server={this.state.server} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Play
