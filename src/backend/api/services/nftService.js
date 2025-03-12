const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { provider, getSigner } = require("../utils/web3Provider");
const config = require("../utils/config");
const { create: ipfsHttpClient } = require("ipfs-http-client"); // Import IPFS client
require("dotenv").config(); // Load biến môi trường từ .env
const axios = require('axios');

// Load ABI của NFT contract
const NFT_ABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "../../../frontend/contractsData/NFT.json"),
    "utf8"
  )
).abi;

// Load ABI của Marketplace contract
const MARKETPLACE_ABI = config.MARKETPLACE_ABI;

// Địa chỉ hợp đồng NFT (cần cập nhật sau khi deploy)
const NFT_ADDRESS = config.NFT_CONTRACT_ADDRESS;

// Địa chỉ hợp đồng Marketplace (cần cập nhật sau khi deploy)
const MARKETPLACE_ADDRESS = config.MARKETPLACE_CONTRACT_ADDRESS;

// Tạo instance của contract NFT
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

// Tạo instance của contract Marketplace
const marketplaceContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

// Lấy thông tin IPFS từ .env
const IPFS_HOST = process.env.IPFS_HOST || "localhost";
const IPFS_PORT = process.env.IPFS_PORT || 5001;
const IPFS_PROTOCOL = process.env.IPFS_PROTOCOL || "http";

// Kết nối tới IPFS node
const ipfs = ipfsHttpClient({
  host: IPFS_HOST,
  port: IPFS_PORT,
  protocol: IPFS_PROTOCOL,
});

/**
 * Mint một NFT mới
 * @param {string} tokenURI - URI metadata trên IPFS
 */
const mintNFT = async (tokenURI) => {
  const signer = await getSigner();
  const contractWithSigner = nftContract.connect(signer);
  const tx = await contractWithSigner.mint(tokenURI);
  await tx.wait();
  return tx;
};

/**
 * Approve NFT cho marketplace
 * @param {number} tokenId - ID của NFT
 */
const approveNFT = async (tokenId) => {
  const signer = await getSigner();
  const contractWithSigner = nftContract.connect(signer);
  const tx = await contractWithSigner.approve(MARKETPLACE_ADDRESS, tokenId);
  await tx.wait();
  return tx;
};

/**
 * Niêm yết NFT lên chợ
 * @param {number} tokenId - ID của NFT
 * @param {string} price - Giá niêm yết
 */
const listNFT = async (tokenId, price) => {
  const signer = await getSigner();
  const contractWithSigner = marketplaceContract.connect(signer);
  const tx = await contractWithSigner.makeItem(NFT_ADDRESS, tokenId, price);
  await tx.wait();
  return tx;
};

// Lây danh sách NFT của một tài khoản
const getNFTsByOwner = async (address) => {
  const ownedTokenIds = await nftContract.getOwnedNFTs(address);
  const nfts = [];

  for (const tokenId of ownedTokenIds) {
    const tokenURI = await nftContract.tokenURI(tokenId);
    const metadata = await axios.get(tokenURI);

    nfts.push({
      tokenId: tokenId.toString(),
      ...metadata.data,
    });
  }

  return nfts;
};

// /**
//  * Lấy metadata của một NFT dựa trên tokenId
//  * @param {number} tokenId - ID của NFT
//  */
// const getNFTMetadata = async (tokenId) => {
//   const tokenURI = await nftContract.tokenURI(tokenId);
//   return tokenURI;
// };

/**
 * Chuyển NFT từ người dùng này sang người dùng khác
 * @param {string} from - Địa chỉ người gửi
 * @param {string} to - Địa chỉ người nhận
 * @param {number} tokenId - ID của NFT
 */
const transferNFT = async (from, to, tokenId) => {
  const signer = await getSigner();
  const contractWithSigner = nftContract.connect(signer);
  const tx = await contractWithSigner.transferFrom(from, to, tokenId);
  await tx.wait();
  return tx;
};

/**
 * Upload metadata lên IPFS
 * @param {object} metadata - Metadata của NFT
 */
const uploadMetadataToIPFS = async (metadata) => {
  const result = await ipfs.add(JSON.stringify(metadata));
  return result.path;
};

module.exports = {
  mintNFT,
  approveNFT,
  listNFT,
  // getNFTMetadata,
  transferNFT,
  uploadMetadataToIPFS,
  getNFTsByOwner
};