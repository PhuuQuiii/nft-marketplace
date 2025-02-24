// test smart contract bằng Hardhat + Chai để kiểm tra việc triển khai NFT Marketplace.

const { expect } = require("chai");

describe("NFTMarketplace", function () {
  // describe() nhóm tất cả các test case liên quan đến NFTMarketplace
  let nft; // Biến để lưu smart contract NFT sau khi deploy.
  let marketplace;
  let deployer; // Tài khoản triển khai smart contract
  let addr1; //  Hai tài khoản người dùng để test
  let addr2;
  let feePercent = 1; // Phí giao dịch (1%)
  let URI = "sample URI" // siêu dữ liệu (metadata) chứa thông tin về NFT


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

    describe("Minting NFTs", function () { // kiểm thử "Minting NFTs"

        it("Should track each minted NFT", async function () {
          // addr1 mints an nft
          await nft.connect(addr1).mint(URI) // addr1 gọi hàm mint(URI) trên smart contract NFT và tạo một NFT mới với URI "sample URI"
          expect(await nft.tokenCount()).to.equal(1); //  đã mint một NFT
          expect(await nft.balanceOf(addr1.address)).to.equal(1); // addr1 sở hữu 1 NFT
          expect(await nft.tokenURI(1)).to.equal(URI); // tokenURI(1) của NFT thứ nhất phải là "sample URI".
          // addr2 mints an nft
          await nft.connect(addr2).mint(URI)
          expect(await nft.tokenCount()).to.equal(2); //  có hai NFT đã được mint
          expect(await nft.balanceOf(addr2.address)).to.equal(1);
          expect(await nft.tokenURI(2)).to.equal(URI);
        });
      })
  });
});
