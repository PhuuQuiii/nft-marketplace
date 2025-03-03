const { ethers } = require("ethers");
require("dotenv").config();

// Kết nối tới blockchain thông qua Ganache hoặc mạng tùy chỉnh
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

async function getSigner() {
    const accounts = await provider.listAccounts();
    return provider.getSigner(accounts[0]); // Lấy signer từ tài khoản đầu tiên của Ganache
}

module.exports = { provider, getSigner };