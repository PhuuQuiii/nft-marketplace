// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage { // Tạo một NFT chuẩn ERC721 có khả năng lưu trữ tokenURI.
    uint public tokenCount; // Lưu trữ tổng số NFT đã được tạo.

    constructor() ERC721("DApp NFT", "DAPP") {} //  DApp NFT → Tên của bộ sưu tập NFT, DAPP → Mã token (symbol) của NFT.

    function mint(string memory _tokenURI) external returns (uint) {
        // Tạo NFT( _tokenURI là metadata (đường dẫn đến ảnh NFT hoặc JSON trên IPFS). )
        tokenCount++; // Mỗi lần tạo mới NFT, giá trị này tăng lên.
        _safeMint(msg.sender, tokenCount); // Mint NFT cho msg.sender (người gọi hàm) // tokenCount là tokenId của NFT
        _setTokenURI(tokenCount, _tokenURI); // Gán tokenURI cho NFT mới và Lưu thông tin metadata của NFT vào server hoặc blockchain, hoặc IPFS
        return (tokenCount); // Trả về tokenId của NFT vừa mint.
    }

    // tokenURI là đường dẫn metadata của NFT, metadata có thể là ảnh, video, JSON, hoặc bất kỳ dữ liệu nào khác.
    //  Nếu _tokenURI chứa URL bình thường, metadata có thể nằm trên một server hoặc blockchain.
    //  Nếu _tokenURI chứa ipfs://CID, metadata được lưu trên IPFS.
}
