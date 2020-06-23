import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'
import GamePage from './pages/GamePage'
import LightPaper from './pages/LightPaper'
import CreateBoardPage from './pages/CreateBoardPage'

import { DrizzleContext } from '@drizzle/react-plugin'

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
        <DrizzleContext.Provider drizzle={this.props.drizzle}>
          <Router>
            <div>
              <Route exact path="/" component={HomePage}/>
              <Route exact path="/lightpaper" component={LightPaper}/>
              <Route exact path="/createboard" component={CreateBoardPage}/>
              <Route exact path="/board" component={BoardListPage}/>
              <Route exact path="/board/:boardId" component={BoardPage}/>
              <Route exact path="/board/:boardId/game/:gameId" component={GamePage}/>
            </div>
          </Router>
        </DrizzleContext.Provider>
      </div>
    );
  }
}

export default App
