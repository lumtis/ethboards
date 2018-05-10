import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import store from '../store'

import Welcome from './containers/Welcome'
import Play from './containers/Play'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


class App extends Component {

  constructor(props) {
    super(props)

    this.hasMetamask = false

    this.state = {
      accountInitialized: false
    }
  }

  componentWillMount() {
    this.hasMetamask = getWeb3()
    var self = this
    var web3 = store.getState().web3.web3Instance

    web3.eth.getAccounts(function(err, accounts) {
      if (accounts.length > 0) {
        var account = {"address":accounts[0], "privateKey":""}
        store.dispatch({type: 'ACCOUNT_LOGIN', payload: {accountInstance: account}})
        self.setState({accountInitialized: true})
      }
      else {
        self.setState({accountInitialized: true})
      }
    })
  }

  render() {
    if (this.state.accountInitialized) {
      return (
        <div>
          <Router>
            <div>
              <Route exact path="/" component={Welcome}/>
              <Route path="/play/:serverid" component={Play}/>
              <Route path="/servers" component={ServerDashboard}/>
              <Route path="/characters" component={CharacterDashboard}/>
            </div>
          </Router>
        </div>
      );
    }
    else {
      return (<div></div>)
    }
  }
}

export default App
