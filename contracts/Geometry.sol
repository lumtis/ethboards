pragma solidity ^0.4.2;

contract Geometry {
    function max(uint a, uint b) internal pure returns (uint) {
        return a > b ? a : b;
    }
    function abs(int a) internal pure returns (uint) {
        return a < 0 ? (uint)(-a) : (uint)(a);
    }
    function distance(uint x1, uint y1, uint x2, uint y2) internal pure returns (uint) {
        return max(abs((int)(x1-x2)), abs((int)(y1-y2)));
    }
}
