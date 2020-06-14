pragma solidity 0.5.16;

interface Pawn {
    function getMetadata() external view returns (string memory);
    function getMoveNumber() external pure returns(uint8);
    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external pure returns(uint8[121] memory);
}