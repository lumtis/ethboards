import React, { Component } from 'react'

import '../App.css'
import Footer from '../components/Footer'

const infoStyle = {
  padding: '20px',
  width: '100%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  boxShadow:'5px 5px rgba(0, 0, 0, 1)'
};

const infoStyle2 = {
  marginRight: 'auto',
  marginLeft: 'auto',
  marginTop: '40px',
  marginBottom: '40px',
  padding: '20px',
  width: '700px',
  position: 'relative',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  boxShadow:'5px 5px rgba(0, 0, 0, 1)'
};

const imageStyle = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg.jpg\')'
}

const imageStyle2 = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg2.jpg\')'
}

const imageStyle3 = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg3.jpg\')'
}


class Info extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
  }

  render() {
    return (
      <div style={{overflowX: 'hidden', marginTop: '100px'}}>
        <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
          <h1>Collectibles</h1>
          <h1>Battle royale</h1>
          <h1>Offchain transactions</h1>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
            <img src="/images/nujaks/arm.png" alt="Nuja" style={imageStyle3}></img>
          </div>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Battle royale</h1>
              <p>NujaBattle is a crypto collectible. Nuja you collect can fight each other in a battle royale style game. 2 to 8 players fight on a 8x8 arena. The last one win the game.</p>
              <p>Each nuja you collect has their own power and weapons are spread all around the map.</p>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Create your own server</h1>
              <p>Servers can be created by anyone, you can create your own map with an intuitive interface. You can also set server fees on your server to earn money when people play on you server.</p>
            </div>
          </div>
          <div className="col-md-6">
            <img src="/images/nujaks/cardPrez.png" alt="Nuja" style={imageStyle}></img>
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
            <img src="/images/nujaks/weapon.png" alt="Nuja" style={imageStyle2}></img>
          </div>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Nearly no fee</h1>
              <p>The game is backed by a multiplayer state channel. Once you join the game, every move is processed offchain and therefore you have no fee to pay or transaction delay</p>
              <p>Transactions to the blockchain are done when you manage servers and when you have to commit the death of a player to the blockchain.</p>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-12">
            <div style={infoStyle2}>
              <h1>Important</h1>
              <p>The dapp is currently under beta testing. All contract are deployed on Ropsten.</p>
              <p>Only starters are currently available. New nujas and weapons will eventually be released but this website is mostly a proof of concept for a, state channel backed, multiplayer arena game.</p>
              <p>The game will also be implemented for humanity.cards, another dapp with real human as character. The dapp is already deployed on the mainnet and available below.</p>
              <div style={{textAlign: 'center'}}>
                <a href="http://humanity.cards"><img style={{marginTop: '50px', marginBottom: '50px'}} border="0" alt="humanitycards" src="/images/humanitycard.png" width="500px" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-12" style={{textAlign: 'center'}}>
            <div style={infoStyle2}>
              <h1>Main Smart Contract</h1>
              <a href='https://ropsten.etherscan.io/address/0x9B546a09ce476Ca22093572B4cC9859737835718'>Server Manager</a>
              <p>Manages servers, allows players to join servers and start them</p>
              <h1>Other Smart Contracts</h1>
              <a href='https://ropsten.etherscan.io/address/0x68EFc525c39103F8803F4C3b673eaC23BC731E8e'>Nuja Battle</a>
              <p>Provides functions to simulate turn and validate killed player</p>
              <a href='https://ropsten.etherscan.io/address/0x3B56d10b800DDD9aC6371bC30745FED9F13Bc112'>Timeout starter</a>
              <p>Provides functions to start a timeout process for a given match</p>
              <a href='https://ropsten.etherscan.io/address/0x5ad3268897d14974b2806196CcDb7ca947c9AAD2'>Timeout stopper</a>
              <p>Provides functions to stop or confirm a timeout process for a given match</p>
              <a href='https://ropsten.etherscan.io/address/0x462893f08BbaED3319a44E613E57e5257b0E5037'>Character Registry</a>
              <p>ERC 721 contract for characters</p>
              <a href='https://ropsten.etherscan.io/address/0x796826c8adEB80A5091CEe9199D551ccB0bd3f18'>Nuja Registry</a>
              <p>Model for characters, register nuja contracts</p>
              <a href='https://ropsten.etherscan.io/address/0xDF480F0D91C0867A0de18DA793486287A22c2243'>Weapon Registry</a>
              <p>Register weapon contracts</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}


export default Info
