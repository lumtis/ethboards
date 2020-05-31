pragma solidity 0.5.12;

interface Pawn {
    function getMetadata() external view returns (string metadata);
    function getMoveNumber() external view returns(uint8);
    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] state
    ) external view returns(uint8[121]);
}