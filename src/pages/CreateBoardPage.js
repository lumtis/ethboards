import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import Navbar from '../components/Navbar'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

class CreateBoardPage extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <h1 style={{
            color: '#cccccc',
            borderColor: '#000000',
            fontSize: '50px',
            padding: '50px',
            textAlign: 'center',
            textShadow: '2px 2px #393e46'
        }}>Under construction</h1>
      </div>
    );
  }
}
export default CreateBoardPage