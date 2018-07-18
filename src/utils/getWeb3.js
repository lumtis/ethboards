import store from '../store'
import Web3 from 'web3'

var nujaBattleJson = require('../../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x59fd4bfa1A29c0cE1dc80E5BB48Ee6Cc5b1650c1'

var serverManagerJson = require('../../build/contracts/ServerManager.json')
var serverManagerAddress = '0x4D336660b3c7267e3aFDd4275ccfFF5B30D697E5'

var timeoutStarterJson = require('../../build/contracts/TimeoutStarter.json')
var timeoutStarterAddress = '0x9f8C0484e696a86b049259583a31dE467Fd53966'

var timeoutStopperJson = require('../../build/contracts/TimeoutStopper.json')
var timeoutStopperAddress = '0xa0b452f5fEd1C60899fC7A7965BB54A520569b08'

var nujaRegistryJson = require('../../build/contracts/NujaRegistry.json')
var nujaRegistryAddress = '0xD47Dc3Ab397b949C8e544076958c911eb3c6aab4'

var characterRegistryJson = require('../../build/contracts/CharacterRegistry.json')
var characterRegistryAddress = '0x3e6e5e80f340789b1d58ef49B4d6ea42A4e846D6'

var weaponRegistryJson = require('../../build/contracts/WeaponRegistry.json')
var weaponRegistryAddress = '0x89e6CB10Ee706752F83E19b6C9d74487D0A8DD1e'


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
    var serverManager = new web3.eth.Contract(serverManagerJson.abi, serverManagerAddress)

    var timeoutStarter = new web3.eth.Contract(timeoutStarterJson.abi, timeoutStarterAddress)
    var timeoutStopper = new web3.eth.Contract(timeoutStopperJson.abi, timeoutStopperAddress)

    var nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    var characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    var weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,

      nujaBattleInstance: nujaBattle,
      serverManagerInstance: serverManager,

      timeoutStarterInstance: timeoutStarter,
      timeoutStopperInstance: timeoutStopper,

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
    var nujaBattle = new web3.eth.Contract(nujaBattleJson.abi, nujaBattleAddress)
    var serverManager = new web3.eth.Contract(serverManagerJson.abi, serverManagerAddress)

    var timeoutStarter = new web3.eth.Contract(timeoutStarterJson.abi, timeoutStarterAddress)
    var timeoutStopper = new web3.eth.Contract(timeoutStopperJson.abi, timeoutStopperAddress)

    var nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    var characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    var weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,

      nujaBattleInstance: nujaBattle,
      serverManagerInstance: serverManager,

      timeoutStarterInstance: timeoutStarter,
      timeoutStopperInstance: timeoutStopper,

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
