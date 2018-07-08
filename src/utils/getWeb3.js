import store from '../store'
import Web3 from 'web3'

var nujaBattleJson = require('../../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x9f8C0484e696a86b049259583a31dE467Fd53966'
var timeoutManagerJson = require('../../build/contracts/TimeoutManager.json')
var timeoutManagerAddress = '0xD47Dc3Ab397b949C8e544076958c911eb3c6aab4'
var nujaRegistryJson = require('../../build/contracts/NujaRegistry.json')
var nujaRegistryAddress = '0x3e6e5e80f340789b1d58ef49B4d6ea42A4e846D6'
var characterRegistryJson = require('../../build/contracts/CharacterRegistry.json')
var characterRegistryAddress = '0x89e6CB10Ee706752F83E19b6C9d74487D0A8DD1e'
var weaponRegistryJson = require('../../build/contracts/WeaponRegistry.json')
var weaponRegistryAddress = '0x4D336660b3c7267e3aFDd4275ccfFF5B30D697E5'

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

    // Get contracts
    var nujaBattle = new web3.eth.Contract(nujaBattleJson.abi, nujaBattleAddress)
    var timeoutManager = new web3.eth.Contract(timeoutManagerJson.abi, timeoutManagerAddress)
    var nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    var characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    var weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,
      nujaBattleInstance: nujaBattle,
      timeoutManagerInstance: timeoutManager,
      nujaRegistryInstance: nujaRegistry,
      characterRegistryInstance: characterRegistry,
      weaponRegistryInstance: weaponRegistry
    }

    console.log('Metamask.');

    store.dispatch(web3Initialized(results))

    return true
  } else {
    // Fallback to localhost if no web3 injection. We've configured this to
    // use the development console's port by default.
    // var provider = new Web3.providers.HttpProvider('http://localhost:8545')
    var provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/KKgWWlE5KNDx1nLnoVtq')
    web3 = new Web3(provider)

    // Get contracts
    nujaBattle = new web3.eth.Contract(nujaBattleJson.abi, nujaBattleAddress)
    timeoutManager = new web3.eth.Contract(timeoutManagerJson.abi, timeoutManagerAddress)
    nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,
      nujaBattleInstance: nujaBattle,
      timeoutManagerInstance: timeoutManager,
      nujaRegistryInstance: nujaRegistry,
      characterRegistryInstance: characterRegistry,
      weaponRegistryInstance: weaponRegistry
    }

    console.log('No matamask.');

    store.dispatch(web3Initialized(results))

    return false
  }
}

export default getWeb3
