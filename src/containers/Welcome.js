import React, { Component } from 'react'
import Particles from 'react-particles-js';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import store from '../store'

import Info from '../containers/Info'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

var noop = function() {};


class Welcome extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
  }

  render() {
    return (
      <div>
      <div className="welcomeWrapper" style={{position: 'absolute'}}>
        <Particles params={{
      		particles: {
            number: {
              value: 120
            },
            size: {
              value: 3
            },
            line_linked: {
              distance: 70
            },
            move: {
              speed: 2
            }
      		}
      	}}
        style={{position: 'absolute'}}/>

        <img src="/images/title.png" style={{width: '100%', bottom: 0, position: 'absolute'}}></img>
        <div style={{textAlign: 'center'}}>
          <Link to="/play"><button className="button" style={playButton}>Play</button></Link>
        </div>
      </div>
      <div style={{position:'absolute', marginTop:'100vh'}} >
        <Info />
      </div>
      </div>
    );
  }
}

const playButton = {
    position: 'absolute',
    top: '40%',
    transform:'translate(-60px, 0px)'
}


export default Welcome
