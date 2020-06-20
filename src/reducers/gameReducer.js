
const initialState = {
    boardState: new Array(121).fill(0),
    boardId: 0,
    gameId: -1,
    playerIndex: -1,
    crosses: {},
    selectedPawn: 0,
    turn: 0
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
        boardId: action.payload.boardId !== undefined ? action.payload.boardId : state.boardId,
        gameId: action.payload.gameId !== undefined ? action.payload.gameId : state.gameId,
        playerIndex: action.payload.playerIndex !== undefined ? action.payload.playerIndex : state.playerIndex,
        turn: action.payload.turn,
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
    const selectedPawn = action.payload.selectedPawn

    return Object.assign({}, state, {
      crosses,
      selectedPawn,
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
  