// Test if a simulation work
// Return false if the smart contract method reverts
export const testSimulate = async (drizzle, boardId, player, move, state) => {
    try {
        await drizzle.contracts.EthBoards.methods.simulate(
            drizzle.contracts.BoardHandler.options.address,
            boardId,
            player,
            move,
            state
        ).call()

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


