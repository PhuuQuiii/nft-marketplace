// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount; // Lưu trữ tổng số NFT đã được tạo.

    // Thêm sự kiện Minted
    event Minted(uint indexed tokenId, address indexed owner, string tokenURI);

    constructor() ERC721("DApp NFT", "DAPP") {} //  DApp NFT → Tên của bộ sưu tập NFT, DAPP → Mã token (symbol) của NFT.

    function mint(string memory _tokenURI) external returns (uint) {
        // Tạo NFT( _tokenURI là metadata (đường dẫn đến ảnh NFT hoặc JSON trên IPFS). )
        tokenCount++; // Mỗi lần tạo mới NFT, giá trị này tăng lên.
        _safeMint(msg.sender, tokenCount); // Mint NFT cho msg.sender (người gọi hàm) // tokenCount là tokenId của NFT
        _setTokenURI(tokenCount, _tokenURI); // Gán tokenURI cho NFT mới và Lưu thông tin metadata của NFT vào server hoặc blockchain, hoặc IPFS
        emit Minted(tokenCount, msg.sender, _tokenURI); // Phát ra sự kiện Minted
        return (tokenCount); // Trả về tokenId của NFT vừa mint.
    }

    // Hàm lấy danh sách NFT thuộc sở hữu của một địa chỉ
    function getOwnedNFTs(address owner) external view returns (uint[] memory) {
        uint[] memory ownedTokens = new uint[](balanceOf(owner));
        uint counter = 0;
        for (uint i = 1; i <= tokenCount; i++) {
            if (ownerOf(i) == owner) {
                ownedTokens[counter] = i;
                counter++;
            }
        }
        return ownedTokens;
    }

    // function tokensOfOwner(address owner) external view returns (uint[] memory) {
    //     uint tokenCount = balanceOf(owner);
    //     uint[] memory tokenIds = new uint[](tokenCount);
    //     for (uint i = 0; i < tokenCount; i++) {
    //         tokenIds[i] = tokenOfOwnerByIndex(owner, i);
    //     }
    //     return tokenIds;
    // }
}
