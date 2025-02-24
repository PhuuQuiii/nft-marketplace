// test smart contract bằng Hardhat + Chai để kiểm tra việc triển khai NFT Marketplace.
const { expect } = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString()); // 1 Ether = 10¹⁸ Wei
const fromWei = (num) => ethers.utils.formatEther(num); // Chuyển đổi từ Wei sang Ether

describe("NFTMarketplace", function () {
  // describe() nhóm tất cả các test case liên quan đến NFTMarketplace
  let nft; // Biến để lưu smart contract NFT sau khi deploy.
  let marketplace;
  let deployer; // Tài khoản triển khai smart contract
  let addr1; //  Hai tài khoản người dùng để test
  let addr2;
  let feePercent = 1; // Phí giao dịch (1%)
  let URI = "sample URI"; // siêu dữ liệu (metadata) chứa thông tin về NFT

  beforeEach(async function () {
    // Lấy contract factory từ ethers
    NFT = await ethers.getContractFactory("NFT");
    Marketplace = await ethers.getContractFactory("Marketplace");
    // Lấy danh sách tài khoản
    [deployer, addr1, addr2] = await ethers.getSigners(); // deployer là tài khoản đầu tiên trong danh sách các tài khoản Hardhat cung cấp.

    // Deploy contract
    nft = await NFT.deploy();
    marketplace = await Marketplace.deploy(feePercent);
  });

  describe("Deployment", function () {
    // Test case kiểm tra việc triển khai hợp đồng
    it("Should track name and symbol of the nft collection", async function () {
      const nftName = "DApp NFT";
      const nftSymbol = "DAPP";
      expect(await nft.name()).to.equal(nftName); // Kiểm tra tên phải là "DApp NFT"
      expect(await nft.symbol()).to.equal(nftSymbol); // Kiểm tra symbol phải là "DAPP"
    });

    it("Should track feeAccount and feePercent of the marketplace", async function () {
      expect(await marketplace.feeAccount()).to.equal(deployer.address); // Địa chỉ nhận phí giao dịch (admin, người deploy contract).
      expect(await marketplace.feePercent()).to.equal(feePercent); //  Phần trăm phí giao dịch mà marketplace thu.
    });

    // kiểm thử "Minting NFTs"
    describe("Minting NFTs", function () {
      it("Should track each minted NFT", async function () {
        // addr1 mints an nft
        await nft.connect(addr1).mint(URI); // addr1 gọi hàm mint(URI) trên smart contract NFT và tạo một NFT mới với URI "sample URI"
        expect(await nft.tokenCount()).to.equal(1); //  đã mint một NFT
        expect(await nft.balanceOf(addr1.address)).to.equal(1); // addr1 sở hữu 1 NFT
        expect(await nft.tokenURI(1)).to.equal(URI); // tokenURI(1) của NFT thứ nhất phải là "sample URI".
        // addr2 mints an nft
        await nft.connect(addr2).mint(URI);
        expect(await nft.tokenCount()).to.equal(2); //  có hai NFT đã được mint
        expect(await nft.balanceOf(addr2.address)).to.equal(1);
        expect(await nft.tokenURI(2)).to.equal(URI);
      });
    });

    describe("Making marketplace items", function () {
      let price = 1;
      let result;
      beforeEach(async function () {
        // addr1 tạo 1 nft
        await nft.connect(addr1).mint(URI);
        // addr1 cấp quyền cho marketplace thao tác NFT của họ
        await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
      });

      it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
        // Addr1 niêm yết NFT có tokenId = 1 với giá 1 ETH (toWei(price)).
        await expect(
          marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price))
        )
          .to.emit(marketplace, "Offered")
          .withArgs(1, nft.address, 1, toWei(price), addr1.address); //  Kiểm tra sự kiện có được phát ra với đúng tham số hay không.
        // Kiểm tra chủ sở hữu của NFT sau khi niêm yết phải là marketplace
        expect(await nft.ownerOf(1)).to.equal(marketplace.address);
        // itemCount phải tăng lên 1 vì một item đã được niêm yết
        expect(await marketplace.itemCount()).to.equal(1);
        // Kiểm tra dữ liệu item trong items mapping
        const item = await marketplace.items(1);
        expect(item.itemId).to.equal(1);
        expect(item.nft).to.equal(nft.address);
        expect(item.tokenId).to.equal(1);
        expect(item.price).to.equal(toWei(price));
        expect(item.sold).to.equal(false);
      });

      it("Should fail if price is set to zero", async function () {
        // Kiểm tra lỗi khi giá là 0
        await expect(
          marketplace.connect(addr1).makeItem(nft.address, 1, 0)
        ).to.be.revertedWith("Price must be greater than zero"); // in ra lỗi "Price must be greater than zero"
      });
    });

    // Kiểm tra người dùng mua NFT trên marketplace
    describe("Purchasing marketplace items", function () {
      let price = 2;
      let fee = (feePercent / 100) * price;
      let totalPriceInWei;
      beforeEach(async function () {
        // addr1 mints an nft
        await nft.connect(addr1).mint(URI);
        // addr1 approves marketplace to spend tokens
        await nft.connect(addr1).setApprovalForAll(marketplace.address, true);
        // addr1 makes their nft a marketplace item.
        await marketplace.connect(addr1).makeItem(nft.address, 1, toWei(price));
      });
      it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
        // Lấy số dư ETH ban đầu của addr1 (người bán) và deployer (marketplace).
        const sellerInitalEthBal = await addr1.getBalance();
        const feeAccountInitialEthBal = await deployer.getBalance();
        //  Lấy tổng giá tiền của NFT (bao gồm phí)
        totalPriceInWei = await marketplace.getTotalPrice(1);
        // Thực hiện giao dịch mua.
        await expect(
          marketplace.connect(addr2).purchaseItem(1, { value: totalPriceInWei }) // purchaseItem nhận kèm ETH từ người mua khi được gọi
        )
          .to.emit(marketplace, "Bought")
          .withArgs(
            1,
            nft.address,
            1,
            toWei(price),
            addr1.address,
            addr2.address
          );
        // Lưu số dư ETH của người bán & marketplace sau giao dịch
        const sellerFinalEthBal = await addr1.getBalance();
        const feeAccountFinalEthBal = await deployer.getBalance();
        //  NFT đã được bán
        expect((await marketplace.items(1)).sold).to.equal(true);
        // Người bán nhận đúng số tiền
        expect(+fromWei(sellerFinalEthBal)).to.equal(
          +price + +fromWei(sellerInitalEthBal) // Số dư ETH của người bán = số dư trước + giá NFT (2 ETH).
        );
        // Marketplace nhận đúng phí giao dịch
        expect(+fromWei(feeAccountFinalEthBal)).to.equal(
          +fee + +fromWei(feeAccountInitialEthBal) // Số dư ETH của marketplace = số dư trước + phí giao dịch.
        );
        // NFT tokenId = 1 phải thuộc về addr2 (người mua)
        expect(await nft.ownerOf(1)).to.equal(addr2.address);
      });
      it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
        // Kiểm tra lỗi khi nhập ID không hợp lệ
        await expect(
          marketplace.connect(addr2).purchaseItem(2, { value: totalPriceInWei })
        ).to.be.revertedWith("item doesn't exist");
        await expect(
          marketplace.connect(addr2).purchaseItem(0, { value: totalPriceInWei })
        ).to.be.revertedWith("item doesn't exist");
        //  Kiểm tra lỗi khi gửi thiếu ETH
        await expect(
          marketplace.connect(addr2).purchaseItem(1, { value: toWei(price) }) // Chỉ gửi số tiền đúng bằng giá NFT, không tính phí giao dịch
        ).to.be.revertedWith(
          "not enough ether to cover item price and market fee"
        );
        // Kiểm tra lỗi khi mua lại NFT đã bán
        // addr2 purchases item 1
        await marketplace
          .connect(addr2)
          .purchaseItem(1, { value: totalPriceInWei });
        // deployer tries purchasing item 1 after its been sold
        await expect(
          marketplace
            .connect(deployer)
            .purchaseItem(1, { value: totalPriceInWei })
        ).to.be.revertedWith("item already sold");
      });
    });
  });
});
