import {getPawnPosition} from './stateUtils'

// Test if a simulation work
// Return false if the smart contract method reverts
export const testSimulate = async (drizzle, boardId, player, move, state) => {
    try {
        const outState = await drizzle.contracts.EthBoards.methods.simulate(
            drizzle.contracts.BoardHandler.options.address,
            boardId,
            player,
            move,
            state
        ).call()

        // when using some networks like Rinkeby, no error is thrown, an incoherent value is returned
        // Check here if the incoherent value is returned
        // TODO: Correctly handle this error
        if (parseInt(outState[0]) > 255) {
            return null
        }

        return [move[2], move[3]]
    } catch (err) {
        return null
    }
}

export const performSimulate = async (drizzle, boardId, player, move, state) => {
    try {
        return await drizzle.contracts.EthBoards.methods.simulate(
            drizzle.contracts.BoardHandler.options.address,
            boardId,
            player,
            move,
            state
        ).call()
    } catch (err) {
        return null
    }
}


