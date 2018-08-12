/*
  Shows the button to go to the server
*/
import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import store from '../store'
import Nuja from '../components/Nuja'

import '../App.css'

var inputStyle = {
  width: '200px',
  margin: '0 auto',
  backgroundColor: 'rgba(236, 236, 236, 0.6)',
  borderRadius: 0,
  border: 0,
  textAlign: 'center',
  marginBottom: '20px'
}

const playButton = {
    position: 'absolute',
    transform:'translate(-60px, 0px)'
}


class Start extends Component {
  constructor(props) {
    super(props)

    this.starterChosen = this.starterChosen.bind(this);

    this.state = {
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      starterClaimed: true,
    }

    store.subscribe(() => {
      this.setState({
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
      })
    })
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if (self.state.characterRegistry != null) {
      self.state.characterRegistry.methods.isStarterClaimed(self.state.account.address).call().then(function(starterClaimed) {
        self.setState({starterClaimed: starterClaimed})
      })
    }
  }


  starterChosen(id) {
    return function(e) {

      var nickname = this.refs.nickname.value

      if (!nickname) {
        alert('Name must not be empty')
      }
      else if (this.state.characterRegistry != null) {
        this.state.characterRegistry.methods.claimStarter(nickname, id).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Chosen')
        });
      }

    }.bind(this)
  }


  render() {

    var chooseStarter = <div></div>
    if(!this.state.starterClaimed) {
      // Form to choose a starter
      chooseStarter =
        <div className="row">
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <h1>Choose your starter</h1>
            <h1>Nickname:</h1>
            <input style={inputStyle} ref="nickname" placeholder="booba" type="text"/>
          </div>
          <div className="row">
            <div className="col-md-4" style={{}}>
              <Nuja nujaIndex={0} />
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <a onClick={this.starterChosen(0)}>
                  <button className='buttonServer'>Choose me !</button>
                </a>
              </div>
            </div>
            <div className="col-md-4" style={{}}>
              <Nuja nujaIndex={1} />
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <a onClick={this.starterChosen(1)}>
                  <button className='buttonServer'>Choose me !</button>
                </a>
              </div>
            </div>
            <div className="col-md-4" style={{}}>
              <Nuja nujaIndex={2} />
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <a onClick={this.starterChosen(2)}>
                  <button className='buttonServer'>Choose me !</button>
                </a>
              </div>
            </div>
          </div>
        </div>
    }

    return(
      <div style={{textAlign: 'center'}}>
        <div>
          <h1 style={{marginTop: '80px'}}>Your address: {this.state.account.address}</h1>
        </div>
        <div>
          {chooseStarter}
        </div>
        <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
          <Link to="/play/0"><button className="button" style={playButton}>Go</button></Link>
        </div>
      </div>
    )
  }
}

export default Start
