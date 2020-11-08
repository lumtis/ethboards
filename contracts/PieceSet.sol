pragma solidity 0.6.11;

/**
 * @title Piece set
 * @notice Register a list of pieces used by a board
*/
contract PieceSet {
    address[] pieces;
    uint8 pieceNb;

    constructor(address[255] memory _pieces, uint8 _pieceNb) public {
        // At least one piece
        require(_pieceNb > 0, "No piece in the piece set");
        // Maximum number of pieces in a piece set
        require(_pieceNb <= 255, "Maximum number of piece is 255");

        for (uint i = 0; i < _pieceNb; i++) {
            pieces.push(_pieces[i]);
        }

        pieceNb = _pieceNb;
    }

    /**
     * @notice Get the number of pieces in the piece set
     * @return number of pieces in the piece set
    */
    function getPieceNb() public view returns(uint8) {
        return pieceNb;
    }

    /**
     * @notice Get the address of a specific piece of the piece set
     * @param index index of the piece
     * @return address of the piece
    */
    function getPiece(uint8 index) public view returns(address) {
        require(index < pieceNb, "The piece doesn't exist");

        return pieces[index];
    }
}