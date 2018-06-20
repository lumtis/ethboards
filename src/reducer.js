import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import web3Reducer from './utils/web3Reducer'
import accountReducer from './utils/accountReducer'
import currentStateReducer from './utils/currentStateReducer'

//import { persistStore, persistCombineReducers } from 'redux-persist'
//
// const config = {
//   key: 'root',
//   storage: localStorage
// }

const reducer = combineReducers({
  routing: routerReducer,
  web3: web3Reducer,
  account: accountReducer,
  currentState: currentStateReducer
})

export default reducer
