import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import Presentation from '../components/Presentation'
import Footer from '../components/Footer'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

class HomePage extends Component {
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
        <div className="backgroundWrapper" style={{
            position:'absolute'
        }} >
          <img src="/assets/general/title.png" alt="ethboards" style={{
              display: 'block',
              marginLeft: '60px',
              marginTop: '60px',
              width: '40%',
          }}></img>
          <div style={{textAlign: 'center', marginTop: '200px', marginBottom: '50px'}}>
            <h1>A simple platform to create games on Ethereum</h1>
          </div>
          <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
            <Link to="/lightpaper/"><button className="button" style={{
              width: '240px',
              height: '60px',
              fontSize: '30px',
            }}>Light Paper</button></Link>
          </div>
        </div>
        {/* <div style={{position:'absolute', marginTop:'100vh'}} >
          <Presentation />
          <Footer />
        </div> */}
      </div>
    );
  }
}

export default HomePage
