const initialState = {
  currentStateInstance: null,
  currentStateMatch: 0,
  currentStateTurn: 0,
  currentStatePlayerTurn: 0,
  originState: null
}

const currentStateReducer = (state = initialState, action) => {
  if (action.type === 'STATE_UPDATED')
  {
    return Object.assign({}, state, {
      currentStateInstance: action.payload.currentStateInstance,
      currentStateMatch: action.payload.currentStateMatch,
      currentStateTurn: action.payload.currentStateTurn,
      currentStatePlayerTurn: action.payload.currentStatePlayerTurn,
      originState: action.payload.originState,
    })
  }

  return state
}

export default currentStateReducer
