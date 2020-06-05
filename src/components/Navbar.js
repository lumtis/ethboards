import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import '../css/navbar.css'

class Navbar extends Component {
  render() {
    const addr = <p>No metamask</p>

    return (
      <div>
        <nav style={{backgroundColor: '#cccccc', position: 'relative', width: '100%', zIndex: 1}}>
         <img src="/assets/general/title.png" alt="ethboards" style={{
                width: '200px',
                marginLeft: '10px',
                marginTop: '10px',
                float: 'left'
          }}></img>
          <div className="container-fluid">
            <ul className="nav navbar-nav" style={{marginLeft: '20px'}}>
              <li className="navcell">
                <Link to="/board" style={{color: '#393e46', textAlign: 'center'}}>join game</Link>
              </li>
              <li className="navcell">
                <Link to="/board" style={{color: '#393e46', textAlign: 'center'}}>create board</Link>
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
