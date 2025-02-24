async function main() {
  const [deployer] = await ethers.getSigners(); // Lệnh này lấy danh sách các tài khoản có trong Hardhat ( tài khoản đầu tiên làm tài khoản triển khai hợp đồng )

  console.log("Deploying contracts with the account:", deployer.address); // địa chỉ ví
  console.log("Account balance:", (await deployer.getBalance()).toString()); //  số dư tài khoản

  // Get the ContractFactories and Signers here.
  const NFT = await ethers.getContractFactory("NFT"); // 	lấy một bản mẫu (factory) của hợp đồng "NFT" từ file Solidity.
  const Marketplace = await ethers.getContractFactory("Marketplace");

  // deploy contracts
  const marketplace = await Marketplace.deploy(1); // thiết lập phí giao dịch của marketplace là 1
  const nft = await NFT.deploy(); // Triển khai hợp đồng lên blockchain

  console.log("NFT contrac address:", nft.address); // Địa chỉ hợp đồng
  console.log("Marketplace contrac address:", marketplace.address); // Địa chỉ hợp đồng

  // Save copies of each contracts abi and address to the frontend.
  saveFrontendFiles(marketplace, "Marketplace");
  saveFrontendFiles(nft, "NFT"); // Lưu trữ địa chỉ và ABI của smart contract để frontend sử dụng.
}

function saveFrontendFiles(contract, name) {
  // Lưu trữ thông tin hợp đồng
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData"; // thư mục chứa thông tin hợp đồng trong frontend.

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`, // Lưu địa chỉ hợp đồng vào file JSON
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`, // Lấy ABI của hợp đồng và lưu vào file JSON.
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
