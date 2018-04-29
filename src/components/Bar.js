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
                <Link to="/play"><a className="navlink">Play <i className="fa fa-gamepad"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/play"><a className="navlink">Collection <i className="fa fa-trophy"></i></a></Link>
              </li>
              <li className="navcell">
                <Link to="/play"><a className="navlink">Marketplace <i className="fa fa-shopping-basket"></i></a></Link>
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
