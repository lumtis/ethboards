import React, { Component } from 'react'
import Particles from 'react-particles-js';
import { BrowserRouter as Router, Link } from 'react-router-dom'

import Info from '../containers/Info'
import Start from '../components/Start'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'


const playButton = {
    position: 'absolute',
    top: '40%',
    transform:'translate(-60px, 0px)'
}

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

          <img src="/images/title.png" alt="Nuja" style={{width: '100%', bottom: 0, position: 'absolute'}}></img>
          <div style={{textAlign: 'center'}}>
            <Link to="/play/0"><button className="button" style={playButton}>Play</button></Link>
          </div>
        </div>
        <div style={{position:'absolute', marginTop:'100vh'}} >
          <Start />
          <Info />
        </div>
      </div>
    );
  }
}


export default Welcome
