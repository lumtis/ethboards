pragma solidity ^0.4.2;


// https://github.com/ethereum/EIPs/issues/721
contract ERC721 {
    function isERC721() public pure returns (bool _b);
    function implementsERC721() public pure returns (bool _b);
    function name() public pure returns (string _name);
    function symbol() public pure returns (string _symbol);
    function totalSupply() public view returns (uint256 _totalSupply);
    function balanceOf(address _owner) public view returns (uint256 _balance);
    function ownerOf(uint256 _tokenId) public view returns (address _owner);
    function approve(address _to, uint256 _tokenId) public;
    function takeOwnership(uint256 _tokenId) public;
    function transferFrom(address _from, address _to, uint256 _tokenId) public;
    function transfer(address _to, uint256 _tokenId) public;
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public constant returns (uint tokenId);
    function tokenMetadata(uint256 _tokenId) public constant returns (string infoUrl);

    event Transfer(address indexed _from, address indexed _to, uint256 _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId);
}
