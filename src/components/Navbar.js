import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import '../css/navbar.css'

class Navbar extends Component {
  render() {
    const addr = <p>No metamask</p>

    return (
      <div>
        <nav style={{backgroundColor: '#424242', position: 'relative', width: '100%', zIndex: 1}}>
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li className="navcell">
                <Link to="/board">Join a game</Link>
              </li>
            </ul>
            <div className="addressStyle" style={{
                paddingTop: '13px',
                color: '#F0F0F0'
            }}>{addr}</div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar
