import store from '../store'
import Web3 from 'web3'

var nujaBattleJson = require('../../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x39DC2821d53d7fF7fB446C4dD96365516114d94E'

var serverManagerJson = require('../../build/contracts/ServerManager.json')
var serverManagerAddress = '0x83516d9D121d5015a78D54249faBE64f16B23a85'

var timeoutStarterJson = require('../../build/contracts/TimeoutStarter.json')
var timeoutStarterAddress = '0x7067a41eE498246f04675c360bd37DA161AAEFCD'

var timeoutStopperJson = require('../../build/contracts/TimeoutStopper.json')
var timeoutStopperAddress = '0xC08606491F3e4722BD8aB63251cD87E37974Eac1'

var nujaRegistryJson = require('../../build/contracts/NujaRegistry.json')
var nujaRegistryAddress = '0xEB7e2A617FE05bCc6A49aE8F4F58e131f2b8f34F'

var characterRegistryJson = require('../../build/contracts/CharacterRegistry.json')
var characterRegistryAddress = '0x65615adECda148E1Ddc6d47ffEa60182a8775FeB'

var weaponRegistryJson = require('../../build/contracts/WeaponRegistry.json')
var weaponRegistryAddress = '0xde24D3a049ba8b1314b291F36eE0a2e78Ec7B64d'


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
