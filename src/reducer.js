import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import gameReducer from './utils/gameReducer'

const reducer = combineReducers({
  routing: routerReducer,
  game: gameReducer,
})

export default reducer
