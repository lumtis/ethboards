// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

/**
 * @title State controller
 * @notice Contain functions to control transition of the game state
*/
library StateController {

    /**
    * Index constant
    */
   
    uint8 constant INDEX_CREDIT_A = 0;
    uint8 constant INDEX_CREDIT_B = 2;
    uint8 constant INDEX_PIECE_TYPE = 4;
    uint8 constant INDEX_PIECE_HEALTH_ITEM = 64;
    uint8 constant INDEX_PIECE_LOCATION = 124;
    uint8 constant INDEX_PRESENCE = 184;
    uint8 constant INDEX_ITEM_PRESENCE = 192

    uint8 constant STATE_SIZE = 200;
    uint8 constant MAX_PIECE_NB = 60;
    uint8 constant MAP_DIM = 8;
    uint constant MAX_CREDIT = 50000;

    /**
     * @notice Set the position of a specific piece in the game
     * @param state the state of the game
     * @param piece the index of the piece
     * @param x x coordinate
     * @param y y coordinate
     * @return the new state once the coordinates (x,y) are set
    */
    function setPiecePosition(uint8[STATE_SIZE] memory state, uint8 piece, uint8 x, uint8 y) private pure returns (uint8[STATE_SIZE] memory) {        
        uint8 location = x+y*MAP_DIM;
        state[INDEX_PIECE_LOCATION+piece] = location;

        return state;
    }

    /**
     * @notice Determine a piece is present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the new state with the presence set
    */
    function setPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) private pure returns (uint8[STATE_SIZE] memory) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 2**x;
        uint8 presenceSet = state[INDEX_PRESENCE+y] | mask;
        state[INDEX_PRESENCE+y] = presenceSet;
        return state;
    }

    /**
     * @notice Determine a piece is not present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the new state with the presence unset
    */
    function unsetPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) private pure returns (uint8[STATE_SIZE] memory) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 255 ^ (2**x);
        uint8 presenceUnset = state[INDEX_PRESENCE+y] & mask;
        state[INDEX_PRESENCE+y] = presenceUnset;
        return state;
    }

    /**
     * @notice Determine an item is present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the new state with the presence set
    */
    function setItemAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) private pure returns (uint8[STATE_SIZE] memory) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 2**x;
        uint8 presenceSet = state[INDEX_ITEM_PRESENCE+y] | mask;
        state[INDEX_ITEM_PRESENCE+y] = presenceSet;
        return state;
    }

    /**
     * @notice Determine a item is not present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the new state with the presence unset
    */
    function unsetItemAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) private pure returns (uint8[STATE_SIZE] memory) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 255 ^ (2**x);
        uint8 presenceUnset = state[INDEX_ITEM_PRESENCE+y] & mask;
        state[INDEX_ITEM_PRESENCE+y] = presenceUnset;
        return state;
    }

    /**
     * @notice Get the credit player A has
     * @return the number of credit
    */
    function getCreditPlayerA(uint8[STATE_SIZE] memory state) public pure returns (uint) {
        uint8 credit1 = state[INDEX_CREDIT_A];
        uint8 credit2 = state[INDEX_CREDIT_A+1];

        // Decode the real value form the two values
        return uint(credit1) + uint(credit2)*256;
    }

    /**
     * @notice Perform the state transition when setting the credit player A has
     * @return the new state once the number of credit is set
    */
    function setCreditPlayerA(uint8[STATE_SIZE] memory state, uint credits) public pure returns (uint8[STATE_SIZE] memory) {
        if (credits > MAX_CREDIT) {
            credits = MAX_CREDIT;
        }
        uint8 credit1 = uint8(credits%256);
        uint8 credit2 = uint8(credits/256);

        state[INDEX_CREDIT_A] = credit1;
        state[INDEX_CREDIT_A+1] = credit2;

        return state;
    }

    /**
     * @notice Get the credit player B has
     * @return the number of credit
    */
    function getCreditPlayerB(uint8[STATE_SIZE] memory state) public pure returns (uint) {
        uint8 credit1 = state[INDEX_CREDIT_B];
        uint8 credit2 = state[INDEX_CREDIT_B+1];

        // Decode the real value form the two values
        return uint(credit1) + uint(credit2)*256;
    }

    /**
     * @notice Perform the state transition when setting the credit player B has
     * @return the new state once the number of credit is set
    */
    function setCreditPlayerB(uint8[STATE_SIZE] memory state, uint credits) public pure returns (uint8[STATE_SIZE] memory) {
        if (credits > MAX_CREDIT) {
            credits = MAX_CREDIT;
        }
        uint8 credit1 = uint8(credits%256);
        uint8 credit2 = uint8(credits/256);

        state[INDEX_CREDIT_B] = credit1;
        state[INDEX_CREDIT_B+1] = credit2;

        return state;
    }

    /**
     * @notice Get the type of a specific piece in the game, the type is what defines the piece (e.g allows to get the specific smart contract of the piece)
     * @param state the state of the game
     * @param piece the index of the piece
     * @return the type of the piece
    */
    function getPieceType(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8) {        
        require(getPieceHealth(state, piece) > 0, "Piece is dead");
        return state[INDEX_PIECE_TYPE+piece];
    }

    /**
     * @notice Get the health of a specific piece in the game, 0 = death
     * @param state the state of the game
     * @param piece the index of the piece
     * @return health (0 - 15)
    */
    function getPieceHealth(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8) {        
        return state[INDEX_PIECE_HEALTH_ITEM+piece]%16;
    }

    /**
     * @notice Restore the health of a piece
     * @param state the state of the game
     * @param piece the index of the piece
     * @param restore restore point
     * @return the new state 
    */
    function restoreHealth(uint8[STATE_SIZE] memory state, uint8 piece, uint8 restore) public pure returns (uint8[STATE_SIZE] memory) {        
        require(getPieceHealth(state, piece) > 0, "Piece is dead");
        uint8 oldHealth = (state[INDEX_PIECE_HEALTH_ITEM+piece]%16);
        if (oldHealth + restore >= 16) {
            restore = 15 - oldHealth;
        }
        state[INDEX_PIECE_HEALTH_ITEM+piece] += restore
        return state;
    }

    /**
     * @notice Damage the health of a piece
     * @param state the state of the game
     * @param piece the index of the piece
     * @param restore damage point
     * @return the new state 
    */
    function damageHealth(uint8[STATE_SIZE] memory state, uint8 piece, uint8 damage) public pure returns (uint8[STATE_SIZE] memory) {        
        require(getPieceHealth(state, piece) > 0, "Piece is dead");
        uint8 oldHealth = (state[INDEX_PIECE_HEALTH_ITEM+piece]%16);
        if (oldHealth <= damage) {
            // The piece is killed and removed
            return removePiece(state, piece);
        }
        state[INDEX_PIECE_HEALTH_ITEM+piece] -= damage
        return state;
    }

    /**
     * @notice Perform the state transition when removing a piece from the game
     * @param state the state of the game
     * @param piece index of the piece
     * @return the new state once the piece has been removed
    */
    function removePiece(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8[STATE_SIZE] memory) {
        require(getPieceHealth(state, piece) > 0, "Piece is dead");

        // We can directly set this value to 0 since the item is removed as well
        state[INDEX_PIECE_HEALTH_ITEM+piece] = 0;

        // Unset the presence
        (uint8 x, uint8 y) = getPiecePosition(state, piece);
        state = unsetPieceAt(state, x, y);

        return state;
    }

    /**
     * @notice Get the position of a specific piece in the game
     * @param state the state of the game
     * @param piece the index of the piece
     * @return the coordinates (x,y) of the piece
    */
    function getPiecePosition(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8, uint8) {
        require(getPieceHealth(state, piece) > 0, "Piece is dead");

        uint8 location = state[INDEX_PIECE_LOCATION+piece]
        return (location%MAP_DIM, location/MAP_DIM);
    }

    /**
     * @notice Check if a piece is present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return true if a piece is present
    */
    function checkPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) public pure returns (bool) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 2**x;
        uint8 presenceFetched = state[INDEX_PRESENCE+y] & mask;
        return presenceFetched>0;
    }

    /**
     * @notice Get the piece present in a specific location in the map
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the piece index if a piece is present, -1 if no piece is present on this location
    */
    function getPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) public pure returns (int8) {
        // Constant complexity check
        if (!checkPieceAt(state, x, y)) {
            return -1;
        }

        // Iterate all pawns
        for (uint8 i = 0; i < MAX_PIECE_NB; i++) {
            if (state[getPieceHealth(state, piece) > 0) {
                uint8 px, py = getPiecePosition(state, i);
                if (px == x && py == y) {
                    return int8(i);
                }
            }
        }

        return -1;
    }

    /**
     * @notice Perform the state transition when moving a piece on the map
     * @param state the state of the game
     * @param piece index of the piece
     * @param x x coordinate where to move the piece
     * @param y y coordinate where to move the piece
     * @return the new state once the piece has been moved
     * TODO: Implement item logic
    */
    function movePiece(uint8[STATE_SIZE] memory state, uint8 piece, uint8 x, uint8 y) public pure returns (uint8[STATE_SIZE] memory) {
        require(state[getPieceHealth(state, piece) > 0, "Piece is dead");
        require(!checkPieceAt(state, x, y), "A piece is already present");

        // Update presence
        (uint8 oldX, uint8 oldY) = getPiecePosition(state, piece);
        state = unsetPieceAt(state, oldX, oldY);
        state = setPieceAt(state, x, y);

        // Modify location of the piece
        uint8 location = x+y*MAP_DIM;
        state[INDEX_PIECE_LOCATION+piece] = location;

        return state;
    }

    /**
     * @notice Perform the state transition when append a new piece
     * @param state the state of the game
     * @param bool true for blue, false for red
     * @param pieceType the type of the piece to respawn
     * @param x x coordinate to respawn the piece
     * @param y y coordinate to respawn the piece
     * @return the new state once the piece has been appended
    */
    function appendPiece(uint8[STATE_SIZE] memory state, bool blue, uint8 pieceType, uint8 x, uint8 y) public pure returns (uint8[STATE_SIZE] memory) {
        require(!checkPieceAt(state, x, y), "A piece is already present");
        uint8 i=0;
        if (!blue) {
            i = 30;
        }
        
        // Check for a slot for the piece
        for (j=0;j<30;j++,i++) {
            if (getPieceHealth(state, i) == 0) {
                // Create the piece
                state[INDEX_PIECE_TYPE+i] = location;
                // Set location of the piece
                uint8 location = x+y*MAP_DIM;
                state[INDEX_PIECE_LOCATION+i] = location;
                state = setPieceAt(state, x, y);
                return state;
            }
        }
        revert("Maximum number of pieces reached");
    }

    /**
     * @notice Perform the state transition when change the piece type of a piece in the game
     * @param state the state of the game
     * @param piece index of the piece
     * @param pieceType the new type of the piece to transform
     * @return the new state once the piece has been transformed
    */
    function transformPiece(uint8[STATE_SIZE] memory state, uint8 piece, uint8 pieceType) public pure returns (uint8[STATE_SIZE] memory) {
        require(state[1+piece] > 0, "Piece is dead");
        state[1+piece] = pieceType;
        return state;
    }

    /**
     * @notice Get the item detained by a specific piece in the game
     * @param state the state of the game
     * @param piece the index of the piece
     * @return item of the piece, 0 is nothing
    */
    function getPieceItem(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8) {        
        require(getPieceHealth(state, piece) > 0, "Piece is dead");
        return state[INDEX_PIECE_HEALTH_ITEM+piece]/16;
    }

    /**
     * @notice Perform the state transition when setting the item detained by a specific piece in the game
     * @param state the state of the game
     * @param piece the index of the piece
     * @param item the item
     * @param itemNb the total number of item
     * @return the new state once item is set
    */
    function setPieceItem(uint8[STATE_SIZE] memory state, uint8 piece uint8 item, uint8 itemNb) public pure returns (uint8) {        
        require(getPieceHealth(state, piece) > 0, "Piece is dead");
        require(item >= itemNb, "Invalid item");

        uint8 changeToTheState = item*16;
        state[INDEX_PIECE_HEALTH_ITEM+piece] += changeToTheState;

        return state;
    }

    /**
     * @notice Check if an item is present at this location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return true if an item is present
    */
    function checkItemAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) public pure returns (bool) {
        uint8 location = x+y*8;

        // This is the bit mask to fetch the presence in the state
        uint8 mask = 2**x;
        uint8 presenceFetched = state[INDEX_ITEM_PRESENCE+y] & mask;
        return presenceFetched>0;
    }
}
