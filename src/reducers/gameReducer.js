const initialState = {
    boardState: new Array(121).fill(0),
    boardId: 0,
  }
  
  const gameReducer = (state = initialState, action) => {
    if (action.type === 'NEW_GAMESTATE')
    {
      const newState = action.payload.newState
      
      if (newState.length === 121) {
        return Object.assign({}, state, {
          boardState: action.payload.newState,
          boardId: action.payload.boardId
        })
      }
    }
    if (action.type === 'RESET_GAMESTATE')
    {
      return Object.assign({}, state, {
        boardState: new Array(121).fill(0)
      })
    }
  
    return state
  }
  
  export default gameReducer
  