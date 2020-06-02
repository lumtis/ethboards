import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import store from './store'

import Home from './containers/Home'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div>
        <Router>
          <div>
            <Route exact path="/" component={Home}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App
