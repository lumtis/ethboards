const initialState = {
  web3Instance: null,
  nujaBattleInstance: null,
  serverManagerInstance: null,
  nujaRegistryInstance: null,
  characterRegistryInstance: null,
  weaponRegistryInstance: null,
  timeoutStarterInstance: null,
  timeoutStopperInstance: null
}

const web3Reducer = (state = initialState, action) => {
  if (action.type === 'WEB3_INITIALIZED')
  {
    return Object.assign({}, state, {
      web3Instance: action.payload.web3Instance,
      nujaBattleInstance: action.payload.nujaBattleInstance,
      serverManagerInstance: action.payload.serverManagerInstance,
      nujaRegistryInstance: action.payload.nujaRegistryInstance,
      characterRegistryInstance: action.payload.characterRegistryInstance,
      weaponRegistryInstance: action.payload.weaponRegistryInstance,
      timeoutStarterInstance: action.payload.timeoutStarterInstance,
      timeoutStopperInstance: action.payload.timeoutStopperInstance
    })
  }

  return state
}

export default web3Reducer
