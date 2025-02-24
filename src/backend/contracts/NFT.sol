// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage { // Tạo một NFT chuẩn ERC721 có khả năng lưu trữ tokenURI.

    uint public tokenCount;// Lưu trữ tổng số NFT đã được tạo.

    constructor() ERC721("DApp NFT", "DAPP"){} //  DApp NFT → Tên của bộ sưu tập NFT, DAPP → Mã token (symbol) của NFT.

    function mint(string memory _tokenURI) external returns(uint) { // Tạo NFT( _tokenURI là metadata (đường dẫn đến ảnh NFT hoặc JSON trên IPFS). )
        tokenCount ++; // Mỗi lần tạo mới NFT, giá trị này tăng lên.
        _safeMint(msg.sender, tokenCount);// Mint NFT cho msg.sender (người gọi hàm) // tokenCount là tokenId của NFT
        _setTokenURI(tokenCount, _tokenURI); // Gán tokenURI cho NFT mới và Lưu thông tin metadata của NFT vào blockchain.
        return(tokenCount); // Trả về tokenId của NFT vừa mint.
    }
}