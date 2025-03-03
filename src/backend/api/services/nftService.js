const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { provider, getSigner } = require("../utils/web3Provider");
const config = require("../utils/config");

// Load ABI của NFT contract
const NFT_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../../../frontend/contractsData/NFT.json"), "utf8")).abi;

// Địa chỉ hợp đồng NFT (cần cập nhật sau khi deploy)
const NFT_ADDRESS = config.NFT_CONTRACT_ADDRESS;

// Tạo instance của contract NFT
const nftContract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

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
 * Lấy metadata của một NFT dựa trên tokenId
 * @param {number} tokenId - ID của NFT
 */
const getNFTMetadata = async (tokenId) => {
  const tokenURI = await nftContract.tokenURI(tokenId);
  return tokenURI;
};

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
  getNFTMetadata,
  transferNFT,
  uploadMetadataToIPFS,
};