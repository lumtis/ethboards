/**
 * Contain utility function to parse the state
 */

export const getPawnNumber = (state) => {
    return parseInt(state[0])
}

export const getPawnPosition = (state, pawn) => {
    return {
        x: parseInt(state[41+pawn]),
        y: parseInt(state[81+pawn])
    }
}

export const getPawnType = (state, pawn) => {
    return parseInt(state[1+pawn])-1
}

export const isAlive = (state, pawn) => {
    return parseInt(state[1+pawn]) > 0
}

// Get the pawn id in a position
export const getPawnAt = (state, x, y) => {
    const pawnNb = parseInt(state[0])
    for (let i = 0; i < pawnNb; i++) {
        if (parseInt(state[1+i]) > 0 && parseInt(state[41+i]) === x && parseInt(state[81+i]) === y) {
            return i
        }
    }

    return -1
}