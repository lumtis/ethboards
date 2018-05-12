import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'


import store from '../store'
import '../css/bar.css'


class Bar extends Component {
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

    if (this.state.account == null) {
      var addr = <p>No metamask</p>
    }
    else {
      addr = <p>{this.state.account.address}</p>
    }

    return (
      <div>
        <nav style={{backgroundColor: '#26E7BC', position: 'relative', width: '100%', zIndex: 1, boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)'}}>
          <div className="container-fluid">
            <ul className="nav navbar-nav">
              <li className="navcell">
                <Link to="/play/0"><a className="navlink">Play <i className="fa fa-gamepad"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/servers"><a className="navlink">My servers <i className="fa fa-map"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/characters"><a className="navlink">My characters <i className="fa fa-user"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/weapon"><a className="navlink">All weapons <i className="fa fa-fighter-jet"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/nuja"><a className="navlink">All nujas <i className="fa fa-users"></i></a></Link>
              </li>
            </ul>
            <div className="addressStyle" style={{paddingTop: '13px'}}>{addr}</div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Bar
