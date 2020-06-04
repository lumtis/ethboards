const initialState = {
    boardState: new Array(121).fill(0)
  }
  
  const gameReducer = (state = initialState, action) => {
    if (action.type === 'NEW_STATE')
    {
      const newState = action.payload.newState
      
      if (newState.length === 121 && !(newState.equals(state))) {
        return Object.assign({}, state, {
          boardState: action.payload.newState
        })
      }
    }
  
    return state
  }
  
  export default gameReducer
  