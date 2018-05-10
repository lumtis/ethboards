import store from '../store'
import Web3 from 'web3'

var nujaBattleJson = require('../../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0'
var nujaRegistryJson = require('../../build/contracts/NujaRegistry.json')
var nujaRegistryAddress = '0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da'
var characterRegistryJson = require('../../build/contracts/CharacterRegistry.json')
var characterRegistryAddress = '0x345cA3e014Aaf5dcA488057592ee47305D9B3e10'
var weaponRegistryJson = require('../../build/contracts/WeaponRegistry.json')
var characterRegistryAddress = 'TODO'

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
    var nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    var characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    var weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,
      nujaBattleInstance: nujaBattle,
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
    nujaRegistry = new web3.eth.Contract(nujaRegistryJson.abi, nujaRegistryAddress)
    characterRegistry = new web3.eth.Contract(characterRegistryJson.abi, characterRegistryAddress)
    var weaponRegistry = new web3.eth.Contract(weaponRegistryJson.abi, weaponRegistryAddress)

    results = {
      web3Instance: web3,
      nujaBattleInstance: nujaBattle,
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
