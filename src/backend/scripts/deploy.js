const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");

module.exports = async function (callback) {
  try {
    // Lấy danh sách tài khoản từ Ganache
    const accounts = await provider.listAccounts();
    const deployer = provider.getSigner(accounts[0]);

    console.log("Deploying contracts with the account:", accounts[0]);

    // Load ABI và Bytecode của hợp đồng NFT
    const NFT_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/NFT.json"), "utf8")).abi;
    const NFT_BYTECODE = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/NFT.json"), "utf8")).bytecode;

    // Load ABI và Bytecode của hợp đồng Marketplace
    const MARKETPLACE_ABI = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/Marketplace.json"), "utf8")).abi;
    const MARKETPLACE_BYTECODE = JSON.parse(fs.readFileSync(path.join(__dirname, "../artifacts/Marketplace.json"), "utf8")).bytecode;

    // Deploy NFT contract
    const NFTFactory = new ethers.ContractFactory(NFT_ABI, NFT_BYTECODE, deployer);
    const nft = await NFTFactory.deploy();
    await nft.deployed();
    console.log("NFT contract deployed at:", nft.address);

    // Deploy Marketplace contract với phí 1%
    const MarketplaceFactory = new ethers.ContractFactory(MARKETPLACE_ABI, MARKETPLACE_BYTECODE, deployer);
    const marketplace = await MarketplaceFactory.deploy(1);
    await marketplace.deployed();
    console.log("Marketplace contract deployed at:", marketplace.address);

    // Lưu thông tin hợp đồng vào frontend
    saveFrontendFiles(nft, "NFT");
    saveFrontendFiles(marketplace, "Marketplace");

    callback(); // Kết thúc script
  } catch (error) {
    console.error(error);
    callback(error);
  }
};

function saveFrontendFiles(contract, name) {
  const contractsDir = path.join(__dirname, "../../frontend/contractsData");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, `${name}-address.json`),
    JSON.stringify({ address: contract.address }, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, `${name}.json`),
    JSON.stringify({ abi: contract.interface.format(ethers.utils.FormatTypes.json) }, null, 2)
  );
}

// function updateEnvFile(nftAddress, marketplaceAddress) {
//   const envFilePath = path.join(__dirname, '../.env');
//   const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

//   envConfig.NFT_CONTRACT_ADDRESS = nftAddress;
//   envConfig.MARKETPLACE_CONTRACT_ADDRESS = marketplaceAddress;

//   const updatedEnvConfig = Object.keys(envConfig).map(key => `${key}=${envConfig[key]}`).join('\n');

//   fs.writeFileSync(envFilePath, updatedEnvConfig);

//   console.log('Updated .env file with new contract addresses.');
// }
