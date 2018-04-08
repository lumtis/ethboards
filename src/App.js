import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import { default as Fade } from 'react-fade'
import PersistGate from 'redux-persist'
import Particles from 'react-particles-js';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import Welcome from './containers/Welcome'
import Play from './containers/Play'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

import store from './store'
// import persistor from './persistor'


class App extends Component {

  constructor(props) {
    super(props)

    this.hasMetamask = false

    this.state = {
    }
  }

  componentWillMount() {
    this.hasMetamask = getWeb3()
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Route exact path="/" component={Welcome}/>
            <Route path="/play" component={Play}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App
