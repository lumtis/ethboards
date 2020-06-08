
const initialState = {
    boardState: new Array(121).fill(0),
    boardId: 0,
    gameId: -1,
    playerIndex: -1,
    crosses: {}
}

const gameReducer = (state = initialState, action) => {
  if (action.type === 'NEW_BOARDSTATE')
  {
    // Action when defnied the state of a board not part of a specific game
    const newState = action.payload.newState

    if (newState.length === 121) {
      return Object.assign({}, state, {
        boardState: newState,
        boardId: action.payload.boardId,
        gameId: -1
      })
    }
  }
  if (action.type === 'NEW_GAMESTATE')
  {
    // Action to define the state of a board part of a specific game
    const newState = action.payload.newState
  
    if (newState.length === 121) {
      return Object.assign({}, state, {
        boardState: newState,
        boardId: action.payload.boardId,
        gameId: action.payload.gameId,
        playerIndex: action.payload.playerIndex
      })
    }
  }
  if (action.type === 'RESET_STATE')
  {
    return Object.assign({}, state, {
      boardState: new Array(121).fill(0),
      gameId: -1
    })
  }
  if (action.type === 'DISPLAY_CROSSES')
  {
    const crosses = action.payload.crosses

    return Object.assign({}, state, {
      crosses: crosses,
    })
  }
  if (action.type === 'RESET_CROSSES')
  {
    return Object.assign({}, state, {
      crosses: {}
    })
  }

  return state
}

export default gameReducer
  