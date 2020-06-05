import React, { Component } from 'react'

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
        <div style={{
            position:'absolute'
        }} >
          <img src="/assets/general/title.png" alt="ethboards" style={{
              display: 'block',
              marginLeft: '10%',
              marginTop: '20px',
              width: '40%',
          }}></img>
          <Presentation />
          <Footer />
        </div>
      </div>
    );
  }
}

export default HomePage
