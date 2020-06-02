import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import store from '../store'
import '../css/navbar.css'


class Navbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: store.getState().account.accountInstance
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance
      });
    });
  }

  static defaultProps = {
  }

  render() {
    const addr = <p>No metamask</p>

    //#F5F5F5

    return (
      <div>
        <nav style={{backgroundColor: '#424242', position: 'relative', width: '100%', zIndex: 1}}>
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li className="navcell">
                <Link to="/play/0"><a className="navlink">Join a game</a></Link>
              </li>
              <li className="navcell">
                <Link to="/servers"><a className="navlink">Create a board</a></Link>
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
