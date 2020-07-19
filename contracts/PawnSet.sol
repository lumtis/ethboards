pragma solidity 0.6.11;

/**
 * @title Pawn set
 * @notice Register a list of pawns used by a board
*/
contract PawnSet {
    address[] pawns;
    uint8 pawnNb;

    constructor(address[255] memory _pawns, uint8 _pawnNb) public {
        // At least one pawn
        require(_pawnNb > 0, "No pawn in the pawn set");
        // Maximum number of pawns in a pawn set
        require(_pawnNb <= 255, "Maximum number of pawn is 255");

        for (uint i = 0; i < _pawnNb; i++) {
            pawns.push(_pawns[i]);
        }

        pawnNb = _pawnNb;
    }

    /**
     * @notice Get the number of pawns in the pawn set
     * @return number of pawns in the pawn set
    */
    function getPawnNb() public view returns(uint8) {
        return pawnNb;
    }

    /**
     * @notice Get the address of a specific pawn of the pawn set
     * @param index index of the pawn
     * @return address of the pawn
    */
    function getPawn(uint8 index) public view returns(address) {
        require(index < pawnNb, "The pawn doesn't exist");

        return pawns[index];
    }
}