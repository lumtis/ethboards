pragma solidity 0.6.11;

import "./PawnSet.sol";

/**
 * @title Pawn set registry
 * @notice List the created pawn sets through events
*/
contract PawnSetRegistry {
    /**
    * Emitted when a new pawn set is created
    * @param pawnSetAddress Address of the pawn set
    * @param name The name of the pawn set
    */
    event PawnSetCreated(
        address pawnSetAddress,
        string name
    );
    
    /**
     * @notice Create a new pawn set
     * @param name name of the pawn set
     * @param pawns addresses of the pawn to add
     * @param pawnNb number of the pawn added
    */
    function createPawnSet(string memory name, address[255] pawns, uint8 pawnNb) public {
        PawnSet pawnSet = new PawnSet(name, pawns, pawnNb);

        emit PawnSetCreated(address(pawnSet), name);
    }
}