import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import '../css/navbar.css'

class Navbar extends Component {
  render() {
    const addr = <p>No metamask</p>

    return (
      <div>
        <nav style={{backgroundColor: 'rgba(200, 200, 200, 0.5)', position: 'relative', width: '100%', zIndex: 1}}>
          <Link to="/">
            <img src="/assets/general/title.png" alt="ethboards" style={{
                  width: '200px',
                  marginLeft: '10px',
                  marginTop: '10px',
                  float: 'left'
            }}></img>
          </Link>
          <div className="container-fluid">
            <ul className="nav navbar-nav" style={{marginLeft: '20px'}}>
              <li className="navcell">
                <Link to="/board" style={{color: '#393e46', textAlign: 'center'}}>Join Game</Link>
              </li>
              <li className="navcell">
                <Link to="/createboard" style={{color: '#393e46', textAlign: 'center'}}>Create Board</Link>
              </li>
              <li className="navcell">
                <Link to="/lightpaper" style={{color: '#393e46', textAlign: 'center'}}>Light Paper</Link>
              </li>
            </ul>
            {/* <div className="addressStyle" style={{
                paddingTop: '13px',
                color: '#F0F0F0'
            }}>{addr}</div> */}
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar
