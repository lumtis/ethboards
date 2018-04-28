import React, { Component } from 'react'

import store from '../store'
import '../css/actions.css'

// TODO: Implement weapon and nuja power


class Actions extends Component {
  constructor(props) {
    super(props)

    this.moveUpLeft = this.moveUpLeft.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveUpRight = this.moveUpRight.bind(this);
    this.moveRight = this.moveRight.bind(this);
    this.moveDownRight = this.moveDownRight.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.moveDownLeft = this.moveDownLeft.bind(this);
    this.moveLeft = this.moveLeft.bind(this);

    this.attackUpLeft = this.attackUpLeft.bind(this);
    this.attackUp = this.attackUp.bind(this);
    this.attackUpRight = this.attackUpRight.bind(this);
    this.attackRight = this.attackRight.bind(this);
    this.attackDownRight = this.attackDownRight.bind(this);
    this.attackDown = this.attackDown.bind(this);
    this.attackDownLeft = this.attackDownLeft.bind(this);
    this.attackLeft = this.attackLeft.bind(this);

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      myTurn: false
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        account: store.getState().account.accountInstance
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.contract != null) {
      self.state.contract.methods.isTurn(self.state.account.address).call().then(function(ret) {
        self.setState({myTurn: ret})
      });
    }
  }

  moveUpLeft(e) {
    e.preventDefault();
    this.command(0, 0, 0, 0, 0)
  }
  moveUp(e) {
    e.preventDefault();
    this.command(0, 1, 0, 0, 0)
  }
  moveUpRight(e) {
    e.preventDefault();
    this.command(0, 2, 0, 0, 0)
  }
  moveRight(e) {
    e.preventDefault();
    this.command(0, 3, 0, 0, 0)
  }
  moveDownRight(e) {
    e.preventDefault();
    this.command(0, 4, 0, 0, 0)
  }
  moveDown(e) {
    e.preventDefault();
    this.command(0, 5, 0, 0, 0)
  }
  moveDownLeft(e) {
    e.preventDefault();
    this.command(0, 6, 0, 0, 0)
  }
  moveLeft(e) {
    e.preventDefault();
    this.command(0, 7, 0, 0, 0)
  }


  attackUpLeft(e) {
    e.preventDefault();
    this.command(1, 0, 0, 0, 0)
  }
  attackUp(e) {
    e.preventDefault();
    this.command(1, 1, 0, 0, 0)
  }
  attackUpRight(e) {
    e.preventDefault();
    this.command(1, 2, 0, 0, 0)
  }
  attackRight(e) {
    e.preventDefault();
    this.command(1, 3, 0, 0, 0)
  }
  attackDownRight(e) {
    e.preventDefault();
    this.command(1, 4, 0, 0, 0)
  }
  attackDown(e) {
    e.preventDefault();
    this.command(1, 5, 0, 0, 0)
  }
  attackDownLeft(e) {
    e.preventDefault();
    this.command(1, 6, 0, 0, 0)
  }
  attackLeft(e) {
    e.preventDefault();
    this.command(1, 7, 0, 0, 0)
  }

  exploreBuilding(e) {
    e.preventDefault();
    this.command(2, 0, 0, 0, 0)
  }


  command(playMove, index, x, y, dir) {
    if (self.state.nujaBattle != null) {
      this.state.contract.methods.play(this.props.server, playMove, index, x, y, dir).send({
        from: this.state.account.address,
        // gas: 500000, TODO: why this is buggy ?
        gasPrice: 2000000000,
      })
      .on('error', function(error){ console.log('ERROR: ' + error)})
      .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
      .on('receipt', function(receipt){ console.log('receipt')})
      .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
      .then(function(ret) {
        alert('Done')
      });
    }
  }

  render() {
    var content = <div></div>

    if(this.state.myTurn) {
      content =
      <div style={{padding: '2px'}}>
        <h3 style={{}}>Move</h3>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.moveUpLeft} className="buttonAction"><i className="fa fa-arrow-up upLeft"></i></button>
          <button onClick={this.moveUp} className="buttonAction"><i className="fa fa-arrow-up"></i></button>
          <button onClick={this.moveUpRight} className="buttonAction"><i className="fa fa-arrow-up upRight"></i></button>
        </div>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.moveLeft} className="buttonAction buttonSide"><i className="fa fa-arrow-left"></i></button>
          <button onClick={this.moveRight} className="buttonAction buttonSide"><i className="fa fa-arrow-right"></i></button>
        </div>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.moveDownLeft} className="buttonAction"><i className="fa fa-arrow-up downLeft"></i></button>
          <button onClick={this.moveDown} className="buttonAction"><i className="fa fa-arrow-down"></i></button>
          <button onClick={this.moveDownRight} className="buttonAction"><i className="fa fa-arrow-up downRight"></i></button>
        </div>
        <h3 style={{}}>Attack</h3>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.attackUpLeft} className="buttonAction"><i className="fa fa-arrow-up upLeft"></i></button>
          <button onClick={this.attackUp} className="buttonAction"><i className="fa fa-arrow-up"></i></button>
          <button onClick={this.attackUpRight} className="buttonAction"><i className="fa fa-arrow-up upRight"></i></button>
        </div>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.attackLeft} className="buttonAction buttonSide"><i className="fa fa-arrow-left"></i></button>
          <button onClick={this.attackRight} className="buttonAction buttonSide"><i className="fa fa-arrow-right"></i></button>
        </div>
        <div style={{textAlign: 'center'}}>
          <button onClick={this.attackDownLeft} className="buttonAction"><i className="fa fa-arrow-up downLeft"></i></button>
          <button onClick={this.attackDown} className="buttonAction"><i className="fa fa-arrow-down"></i></button>
          <button onClick={this.attackDownRight} className="buttonAction"><i className="fa fa-arrow-up downRight"></i></button>
        </div>
        <button onClick={this.attackDownRight} className="buttonAction">Explore building<i className="fa fa-building"></i></button>
      </div>
    }
    else {
      content = <h3>Not your turn</h3>
    }

    return (
      <div>{content}</div>
    );
  }
}

export default Actions
