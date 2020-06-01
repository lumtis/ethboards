import React, { Component } from 'react'
// import getWeb3 from './utils/getWeb3'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import store from './store'

import Welcome from './containers/Welcome'
import Play from './containers/Play'
import ServerDashboard from './containers/ServerDashboard'
import CharacterDashboard from './containers/CharacterDashboard'
import NujaPage from './containers/NujaPage'
import WeaponPage from './containers/WeaponPage'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


class App extends Component {

  constructor(props) {
    super(props)


    this.state = {
      accountInitialized: false
    }
  }


  render() {
    return (
      <div>
        <Router>
          <div>
            <Route exact path="/" component={Welcome}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App
