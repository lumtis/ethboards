const initialState = {
  accountInstance: null
}

const accountReducer = (state = initialState, action) => {
  if (action.type === 'ACCOUNT_LOGIN')
  {
    localStorage.setItem("account", JSON.stringify(action.payload.accountInstance))
    return Object.assign({}, state, {
      accountInstance: action.payload.accountInstance
    })
  }
  if (action.type === 'ACCOUNT_LOGOUT')
  {
    localStorage.setItem("account", '')
    return Object.assign({}, state, {
      accountInstance: null
    })
  }

  return state
}

export default accountReducer
