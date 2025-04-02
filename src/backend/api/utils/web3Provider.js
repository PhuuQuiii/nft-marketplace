const { ethers } = require("ethers");
require("dotenv").config();

// Kết nối tới blockchain thông qua Ganache hoặc mạng tùy chỉnh
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");

async function getSigner() {
  const accounts = await provider.listAccounts();
  return provider.getSigner(accounts[0]); // Lấy signer từ tài khoản đầu tiên của Ganache
}

async function getSignerByAddress(address) {
  const accounts = await provider.listAccounts();
  const signer = provider.getSigner(address);
  return signer;
}

module.exports = { provider, getSigner, getSignerByAddress };
