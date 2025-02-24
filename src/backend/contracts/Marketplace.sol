// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // giao diện chuẩn ERC-721, giúp contract có thể tương tác với các NFT khác.

import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // một cơ chế bảo vệ chống lại Reentrancy Attack (tấn công tái nhập)


contract Marketplace is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; // chủ sở hữu marketplace (admin) nhận Ether từ các giao dịch
    uint public immutable feePercent; // Phí giao dịch mà marketplace thu từ người bán
    uint public itemCount;  //  số lượng NFT được niêm yết trên Marketplace

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender); // admin (người deploy contract) sẽ nhận phí giao dịch.
        feePercent = _feePercent; // thiết lập phí giao dịch của marketplace( feePercent = 1)
    }
}
