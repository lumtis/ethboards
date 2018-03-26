import store from '../store'
import Web3 from 'web3'

export const WEB3_INITIALIZED = 'WEB3_INITIALIZED'
function web3Initialized(results) {
  return {
    type: WEB3_INITIALIZED,
    payload: results
  }
}

function getWeb3() {
  var results
  var web3 = window.web3

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider.
    web3 = new Web3(web3.currentProvider)

    // Get humanity card contract
    var contract = null

    results = {
      web3Instance: web3,
      contractInstance: contract
    }

    console.log('Injected web3 detected.');

    store.dispatch(web3Initialized(results))

    return 0
  } else {
    // Fallback to localhost if no web3 injection. We've configured this to
    // use the development console's port by default.
    // var provider = new Web3.providers.HttpProvider('http://localhost:8545')
    var provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/KKgWWlE5KNDx1nLnoVtq')
    web3 = new Web3(provider)

    // Get humanity card contract
    var contract = null

    results = {
      web3Instance: web3,
      contractInstance: contract
    }

    console.log('No web3 instance injected, using Local web3.');

    store.dispatch(web3Initialized(results))

    return 1
  }
}

export default getWeb3
