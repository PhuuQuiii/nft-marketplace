require("dotenv").config(); // Load biến môi trường từ .env

module.exports = {
  PORT: process.env.PORT || 5000,
  RPC_URL: process.env.RPC_URL || "http://127.0.0.1:7545",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  
  // Cấu hình IPFS
  IPFS_HOST: process.env.IPFS_HOST || "localhost",
  IPFS_PORT: process.env.IPFS_PORT || 5001,
  IPFS_PROTOCOL: process.env.IPFS_PROTOCOL || "http",

  // Địa chỉ smart contract (sẽ cập nhật sau khi deploy)
  NFT_CONTRACT_ADDRESS: process.env.NFT_CONTRACT_ADDRESS || "",
  MARKETPLACE_CONTRACT_ADDRESS: process.env.MARKETPLACE_CONTRACT_ADDRESS || "",
};
