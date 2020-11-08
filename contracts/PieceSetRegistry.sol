pragma solidity 0.6.11;

import "./PieceSet.sol";

/**
 * @title Piece set registry
 * @notice List the created piece sets through events
*/
contract PieceSetRegistry {
    /**
    * Emitted when a new piece set is created
    * @param pieceSetAddress Address of the piece set
    * @param name The name of the piece set
    */
    event PieceSetCreated(
        address pieceSetAddress,
        string name
    );

    /**
     * @notice Create a new piece set
     * @param name name of the piece set
     * @param pieces addresses of the piece to add
     * @param pieceNb number of the piece added
     * @return address of the piece set
    */
    function createPieceSet(string memory name, address[255] memory pieces, uint8 pieceNb) public returns (address) {
        PieceSet pieceSet = new PieceSet(pieces, pieceNb);

        emit PieceSetCreated(address(pieceSet), name);

        return address(pieceSet);
    }
}