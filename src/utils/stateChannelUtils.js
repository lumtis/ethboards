/**
 * Communication with the state channel server
 */
const axios = require('axios');
const stateChannelServer = process.env.STATECHANNELS_SERVER_URL

exports.getTurn = async (boardId, gameId) => {
    const request = stateChannelServer + '/turn?boardId=' + boardId + '&gameId=' + gameId

    try {
        const response = await axios.get(request)
        return parseInt(response.data)
    } catch(error) {
        console.log(error)
        return -1
    }
}

exports.getState = async (boardId, gameId) => {
    const request = stateChannelServer + '/state?boardId=' + boardId + '&gameId=' + gameId

    try {
        const response = await axios.get(request)
        return response.data
    } catch(error) {
        console.log(error)
        return []
    }
}

exports.getLatestStateSignature = async (boardId, gameId) => {
    const request = stateChannelServer + '/statesignature?boardId=' + boardId + '&gameId=' + gameId

    try {
        const response = await axios.get(request)
        return response.data
    } catch(error) {
        console.log(error)
        return {}
    }
}

exports.sendMove = async (boardId, gameId, move, rsv) => {
    try {
        const response = await axios.post(
            stateChannelServer + '/newmove', 
            {
                boardid: boardId,
                gameid: gameId,
                move,
                r: Array.from(rsv.r),
                s: Array.from(rsv.s),
                v: rsv.v,
            },
        )
        return {
            newState: response.data.newstate,
            newTurn: parseInt(response.data.newturn),
        }
    } catch(error) {
        console.log(error)
        return null
    }
}