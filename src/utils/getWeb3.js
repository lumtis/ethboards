import store from '../store'
import Web3 from 'web3'

var nujaBattleJson = require('../../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x68EFc525c39103F8803F4C3b673eaC23BC731E8e'

var serverManagerJson = require('../../build/contracts/ServerManager.json')
var serverManagerAddress = '0x9B546a09ce476Ca22093572B4cC9859737835718'

var timeoutStarterJson = require('../../build/contracts/TimeoutStarter.json')
var timeoutStarterAddress = '0x3B56d10b800DDD9aC6371bC30745FED9F13Bc112'

var timeoutStopperJson = require('../../build/contracts/TimeoutStopper.json')
var timeoutStopperAddress = '0x5ad3268897d14974b2806196CcDb7ca947c9AAD2'

var nujaRegistryJson = require('../../build/contracts/NujaRegistry.json')
var nujaRegistryAddress = '0x796826c8adEB80A5091CEe9199D551ccB0bd3f18'

var characterRegistryJson = require('../../build/contracts/CharacterRegistry.json')
var characterRegistryAddress = '0x462893f08BbaED3319a44E613E57e5257b0E5037'

var weaponRegistryJson = require('../../build/contracts/WeaponRegistry.json')
var weaponRegistryAddress = '0xDF480F0D91C0867A0de18DA793486287A22c2243'


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
    var provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/KKgWWlE5KNDx1nLnoVtq')
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
