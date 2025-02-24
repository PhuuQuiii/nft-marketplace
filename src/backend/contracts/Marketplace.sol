// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol"; // giao diện chuẩn ERC-721, giúp contract có thể tương tác với các NFT khác.

import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; // một cơ chế bảo vệ chống lại Reentrancy Attack (tấn công tái nhập)


contract Marketplace is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; // chủ sở hữu marketplace (admin) nhận Ether từ các giao dịch
    uint public immutable feePercent; // Phí giao dịch mà marketplace thu từ người bán
    uint public itemCount;  //  số lượng NFT được niêm yết trên Marketplace
    struct Item { // lưu thông tin chi tiết của NFT được niêm yết trên Marketplace
        uint itemId;
        IERC721 nft; // Hợp đồng NFT (IERC721) liên kết với NFT này
        uint tokenId;
        uint price;
        address payable seller;
        bool sold;
    }

    // Sự kiện được phát khi một NFT được niêm yết trên Marketplace.
    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller
    ); // address indexed:	Địa chỉ hợp đồng NFT chứa NFT này

    // itemId -> Item
    mapping(uint => Item) public items; // lưu danh sách các Item dựa trên itemId

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender); // admin (người deploy contract) sẽ nhận phí giao dịch.
        feePercent = _feePercent; // thiết lập phí giao dịch của marketplace( feePercent = 1)
    }

    // niêm yết NFT lên Marketplace ( NFT của họ sẽ được chuyển vào Marketplace và danh sách NFT đang bán sẽ được cập nhật.)
    function makeItem(IERC721 _nft, uint _tokenId, uint _price) external nonReentrant { // Reentrancy Attack (tấn công tái nhập)
        require(_price > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;
        // transferFrom: Gọi hàm chuyển quyền sở hữu của ERC-721 để chuyển NFT vào Marketplace.
        _nft.transferFrom(msg.sender, address(this), _tokenId); // msg.sender: Địa chỉ của người đang bán NFT // address(this): Địa chỉ của Marketplace (tức là hợp đồng Marketplace sẽ giữ NFT này) //  tokenId của NFT người bán muốn niêm yết
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false // chưa bán
        );
        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }
}
