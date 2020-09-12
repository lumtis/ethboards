import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import '../css/navbar.css'

class Navbar extends Component {
  render() {
    return (
      <div style={{width: '100vw'}}>
        <nav className="navbar navbar-expand-lg" style={{backgroundColor: 'rgba(200, 200, 200, 0.5)', position: 'relative', width: '100%', zIndex: 1}}>
          <Link to="/">
            <img src="/assets/general/title.png" alt="ethboards" style={{
                  width: '200px',
                  marginLeft: '10px',
                  marginTop: '10px',
                  float: 'left'
            }}></img>
          </Link>
          <div className="collapse navbar-collapse">
            <ul className="nav navbar-nav" style={{marginLeft: '20px'}}>
              <li className="navcell">
                <Link to="/board" style={linkStyle}>Join Game</Link>
              </li>
              <li className="navcell">
                <Link to="/createboard" style={linkStyle}>Create Board</Link>
              </li>
              <li className="navcell">
                <a href="https://github.com/ltacker/ethboards/blob/master/LightPaper.md" style={linkStyle}>Light Paper</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}

const linkStyle = {
  color: '#393e46',
  textAlign: 'center',
  fontFamily: 'Verdana',
  width: '130px'
}

export default Navbar
