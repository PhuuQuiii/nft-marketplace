const nftService = require("../services/nftService");
const { ethers } = require("ethers");

/**
 * Tạo NFT và niêm yết lên chợ
 * @param {object} metadata - Metadata của NFT
 */
exports.createNFT = async (req, res) => {
  try {
    const { image, price, name, description } = req.body;
    if (!image || !price || !name || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload metadata lên IPFS
    const metadata = { image, price, name, description };
    const ipfsHash = await nftService.uploadMetadataToIPFS(metadata);
    const uri = `http://localhost:8080/ipfs/${ipfsHash}`;

    // Mint NFT
    const mintTransaction = await nftService.mintNFT(uri);
    const mintReceipt = await mintTransaction.wait();
    const tokenId = mintReceipt.events[0].args.tokenId.toString();

    // // Cấp quyền cho marketplace
    // const approvalTransaction = await nftService.approveNFT(tokenId);
    // await approvalTransaction.wait();

    // // Niêm yết NFT lên chợ
    // const listingPrice = ethers.utils.parseEther(price.toString());
    // const listingTransaction = await nftService.listNFT(tokenId, listingPrice);
    // await listingTransaction.wait();

    res.json({ message: "NFT created successfully", tokenId });
  } catch (error) {
    console.error("Error creating NFT:", error);
    res.status(500).json({ error: "Failed to create NFT" });
  }
};