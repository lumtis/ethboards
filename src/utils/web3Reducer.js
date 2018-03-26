const initialState = {
  web3Instance: null,
  contractInstance: null
}

const web3Reducer = (state = initialState, action) => {
  if (action.type === 'WEB3_INITIALIZED')
  {
    return Object.assign({}, state, {
      web3Instance: action.payload.web3Instance,
      contractInstance: action.payload.contractInstance
    })
  }

  return state
}

export default web3Reducer
