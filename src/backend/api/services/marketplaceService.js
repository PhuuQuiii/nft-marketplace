const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { provider, getSigner } = require("../utils/web3Provider");
const config = require("../utils/config");

// Load ABI của Marketplace contract
const MARKETPLACE_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../frontend/contractsData/Marketplace.json"), "utf8")).abi;

// Địa chỉ hợp đồng Marketplace (cần cập nhật sau khi deploy)
const MARKETPLACE_ADDRESS = config.MARKETPLACE_CONTRACT_ADDRESS;

// Tạo instance của contract Marketplace
const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

/**
 * Đăng NFT lên Marketplace để bán
 * @param {string} nftAddress - Địa chỉ hợp đồng NFT
 * @param {number} tokenId - ID của NFT
 * @param {string} price - Giá bán NFT (wei)
 */
const listNFTForSale = async (nftAddress, tokenId, price) => {
  const signer = await getSigner();
  const contractWithSigner = marketplaceContract.connect(signer);
  const tx = await contractWithSigner.makeItem(nftAddress, tokenId, price);
  await tx.wait();
  return tx;
};

/**
 * Mua NFT từ Marketplace
 * @param {number} itemId - ID của Item cần mua
 * @param {string} price - Giá NFT (wei)
 */
const buyNFT = async (itemId, price) => {
  const signer = await getSigner();
  const contractWithSigner = marketplaceContract.connect(signer);
  const tx = await contractWithSigner.purchaseItem(itemId, { value: price });
  await tx.wait();
  return tx;
};

/**
 * Lấy tổng giá tiền NFT cần thanh toán
 * @param {number} itemId - ID của Item
 */
const getTotalPrice = async (itemId) => {
  const totalPrice = await marketplaceContract.getTotalPrice(itemId);
  return totalPrice;
};

module.exports = {
  listNFTForSale,
  buyNFT,
  getTotalPrice,
};