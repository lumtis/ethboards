pragma solidity ^0.4.2;


// https://github.com/ethereum/EIPs/issues/721
contract ERC721 {
    function isERC721() public pure returns (bool b);
    function implementsERC721() public pure returns (bool b);
    function name() public pure returns (string name);
    function symbol() public pure returns (string symbol);
    function totalSupply() public view returns (uint256 totalSupply);
    function balanceOf(address _owner) public view returns (uint256 balance);
    function ownerOf(uint256 _tokenId) public view returns (address owner);
    function approve(address _to, uint256 _tokenId) public;
    function takeOwnership(uint256 _tokenId) public;
    function transferFrom(address _from, address _to, uint256 _tokenId) public;
    function transfer(address _to, uint256 _tokenId) public;
    function tokenOfOwnerByIndex(address _owner, uint256 _index) constant returns (uint tokenId);
    function tokenMetadata(uint256 _tokenId) constant returns (string infoUrl);

    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
}
