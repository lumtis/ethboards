import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert'

import 'react-confirm-alert/src/react-confirm-alert.css'
import store from '../store'


var noop = function() {};

class Footer extends Component {
  constructor(props) {
    super(props)

    this.termsOfUse = this.termsOfUse.bind(this)

    this.state = {
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
  }

  termsOfUse(e) {
    e.preventDefault();

    var informationDiv =
    <div style={{height: '400px', overflowY: 'scroll'}}>
      <h3>1. Terms</h3>
      <p>By accessing the website at http://humanity.cards, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.YOU SHOULD BE AT LEAST 18 YEARS OF AGE TO ACCESS THE SITE. IF YOU DISAGREE WITH ALL OF THE PROVISION OF THESE TERMS, DO NOT LOG INTO AND/OR USE THE SITE.</p>

      <h3>2. Use License</h3>
      <p>Permission is granted to temporarily download one copy of the materials (information or software) on Humanity Cards' website for personal, non-commercial transitory viewing only.</p>

      <h3>3. Disclaimer</h3>
      <p>The materials on Humanity Cards's website are provided on an 'as is' basis. Humanity Cards makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
      <p>Further, Humanity Cards does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.</p>

      <h3>4. Limitations</h3>
      <p>In no event shall Humanity Cards or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Humanity Cards' website, even if Humanity Cards or a Humanity Cards authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>

      <h3>5. Accuracy of materials</h3>
      <p>The materials appearing on Humanity Cards website could include technical, typographical, or photographic errors. Humanity Cards does not warrant that any of the materials on its website are accurate, complete or current. Humanity Cards may make changes to the materials contained on its website at any time without notice. However Humanity Cards does not make any commitment to update the materials.</p>

      <h3>6. Links</h3>
      <p>Humanity Cards has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Humanity Cards of the site. Use of any such linked website is at the user's own risk.</p>

      <h3>7. Smart contract</h3>
      <p>Humanity Cards is a Decentralized Application (Dapp) where you can collect people that "made history" and NOT "great" people. Humanity Cards is not praising any character in the smart contract. We are here to promote the history of humanity.</p>
      <p>The incoming battle game stated in the Dapp's description will be another Dapp using Humanity Cards. The new Dapp for the battle game will not include controversial and/or shocking characters of Humanity Cards.</p>
      <p>Every function in the smart contract can be used by anyone to make their own Dapp. Humanity Cards is NOT responsible of any use made by the characters provided by the smart contract.</p>
      <p>The website provides functions for the basic use of the smart contract, Humanity Cards is not responsible for the misuse of the smart contract outside the website.</p>
      <p>By using the website, you consider that the smart contract is functional, user will be not refund after mining cards.</p>

      <h3>8. Modifications</h3>
      <p>Humanity Cards may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>
    </div>
    confirmAlert({
      title: 'Terms of use',
      message: '',
      childrenElement: () => informationDiv,
      confirmLabel: 'I agree',
      cancelLabel: 'I disagree',
      onConfirm: noop,
      onCancel: noop,
    })
  }

  render() {
    return (
      <div style={footerStyle}>
        <div style={{padding: '31px'}}>
          <p>© 2018: Soyjak Battle | <button style={{backgroundColor: '#16D7AC', border: '0px'}} onClick={this.termsOfUse}><a style={linkStyle}>Terms of use</a></button> | <a href="mailto:soyjakbattle@gmail.com" style={linkStyle}>soyjakbattle@gmail.com</a></p>
        </div>
      </div>
    );
  }
}

const footerStyle = {
  fontSize: '16px',
  height: '100px',
  width: '100%',
  backgroundColor: '#16D7AC',
  color: 'white',
  textAlign: 'center',
  marginTop: '30px',
};

const linkStyle = {
  cursor: 'pointer',
  color: 'white'
}

export default Footer
