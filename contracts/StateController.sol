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
    uint8 constant INDEX_PIECE_INFO = 4;
    uint8 constant INDEX_PIECE_LOCATION = 64;
    uint8 constant INDEX_PRESENCE = 124;

    uint8 constant STATE_SIZE = 128;
    uint8 constant MAX_PIECE_NB = 60;
    uint8 constant MAP_HEIGHT = 8;
    uint8 constant MAP_WIDTH = 8;
    uint constant MAX_CREDIT = 50000;

    /**
    * State observation utilitary function
    */

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
     * @notice Get the position of a specific piece in the game
     * @param state the state of the game
     * @param piece the index of the piece
     * @return the coordinates (x,y) of the piece
    */
    function getPiecePosition(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8, uint8) {
        require(state[1+piece] > 0, "Piece is dead");

        return (state[41+piece], state[81+piece]);
    }

    /**
     * @notice Get the type of a specific piece in the game, the type is what defines the piece (e.g allows to get the specific smart contract of the piece)
     * @param state the state of the game
     * @param piece the index of the piece
     * @return the type of the piece
    */
    function getPieceType(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (uint8) {
        require(state[1+piece] > 0, "Piece is dead");

        return state[1+piece]-1;
    }

    /**
     * @notice Determine if a specific piece in the game is still alive
     * @param state the state of the game
     * @param piece the index of the piece
     * @return true if the piece is still alive
    */
    function isAlive(uint8[STATE_SIZE] memory state, uint8 piece) public pure returns (bool) {
        return state[1+piece] > 0;
    }

    /**
     * @notice Get the piece present in a specific location in the map
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the piece index if a piece is present, -1 if no piece is present on this location
    */
    function getPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y) public pure returns (int8) {
        for (uint8 i = 0; i < 40; i++) {
            if (state[1+i] > 0 && state[41+i] == x && state[81+i] == y) {
                return int8(i);
            }
        }

        return -1;
    }

    /**
     * @notice Check if a piece is present on a specific location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return true if NO piece is present, false otherwise
    */
    function noPieceAt(uint8[STATE_SIZE] memory state, uint8 x, uint y)  public pure returns (bool) {
        return getPieceAt(state, x, y) == -1;
    }

    /**
    * State transition utilitary function
    */

    /**
     * @notice Set the credit player A has
     * @return the number of credit
    */
    function setCreditPlayerA(uint8[STATE_SIZE] memory state, uint credits) public pure returns (uint8[121] memory) {
        require(credits < MAX_CREDIT, "Too much credit");
        uint8 credit1 = uint8(credits%256);
        uint8 credit2 = uint8(credits/256);

        state[INDEX_CREDIT_A] = credit1;
        state[INDEX_CREDIT_A+1] = credit2;

        return state;
    }

    /**
     * @notice Set the credit player B has
     * @return the number of credit
    */
    function setCreditPlayerB(uint8[STATE_SIZE] memory state, uint credits) public pure returns (uint8[121] memory) {
        require(credits < MAX_CREDIT, "Too much credit");
        uint8 credit1 = uint8(credits%256);
        uint8 credit2 = uint8(credits/256);

        state[INDEX_CREDIT_B] = credit1;
        state[INDEX_CREDIT_B+1] = credit2;

        return state;
    }

    /**
     * @notice Perform the state transition when moving a piece on the map
     * @param state the state of the game
     * @param piece index of the piece
     * @param x x coordinate where to move the piece
     * @param y y coordinate where to move the piece
     * @return the new state once the piece has been moved
    */
    function movePiece(uint8[STATE_SIZE] memory state, uint8 piece, uint8 x, uint8 y) public pure returns (uint8[121] memory) {
        require(state[1+piece] > 0, "Piece is dead");
        require(getPieceAt(state, x, y) == -1, "A piece is already present");

        state[41+piece] = x;
        state[81+piece] = y;

        return state;
    }

    /**
     * @notice Perform the state transition when removing a piece from the game
     * @param state the state of the game
     * @param piece index of the piece
     * @return the new state once the piece has been removed
    */
    function removePiece(uint8[121] memory state, uint8 piece) public pure returns (uint8[121] memory) {
        require(state[1+piece] > 0, "Piece is dead");

        state[1+piece] = 0;

        return state;
    }

    /**
     * @notice Perform the state transition when change the piece type or revive a piece in the game
     * @param state the state of the game
     * @param piece index of the piece
     * @param pieceType the type of the piece to respawn
     * @param x x coordinate to respawn the piece
     * @param y y coordinate to respawn the piece
     * @return the new state once the piece has been respawned
    */
    function respawnPiece(uint8[121] memory state, uint8 piece, uint8 pieceType, uint8 x, uint8 y) public pure returns (uint8[121] memory) {
        require(state[1+piece] == 0, "Piece is still alive");
        require(getPieceAt(state, x, y) == -1, "A piece is already present");

        state[1+piece] = pieceType + 1;
        state[41+piece] = x;
        state[81+piece] = y;

        return state;
    }

    /**
     * @notice Perform the state transition when change the piece type of a piece in the game
     * @param state the state of the game
     * @param piece index of the piece
     * @param pieceType the new type of the piece to transform
     * @return the new state once the piece has been transformed
    */
    function transformPiece(uint8[121] memory state, uint8 piece, uint8 pieceType) public pure returns (uint8[121] memory) {
        require(state[1+piece] > 0, "Piece is dead");

        state[1+piece] = pieceType + 1;

        return state;
    }
}
