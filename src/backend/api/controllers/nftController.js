const nftService = require("../services/nftService");
const { ethers } = require("ethers");

/**
 * Tạo NFT và niêm yết lên chợ
 * @param {object} metadata - Metadata của NFT
 */
exports.createAndListNFT = async (req, res) => {
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

    // Cấp quyền cho marketplace
    const approvalTransaction = await nftService.approveNFT(tokenId);
    await approvalTransaction.wait();

    // Niêm yết NFT lên chợ
    const listingPrice = ethers.utils.parseEther(price.toString());
    const listingTransaction = await nftService.listNFT(tokenId, listingPrice);
    await listingTransaction.wait();

    res.json({ message: "NFT created and listed successfully", tokenId });
  } catch (error) {
    console.error("Error creating and listing NFT:", error);
    res.status(500).json({ error: "Failed to create and list NFT" });
  }
};

// /**
//  * Mint NFT
//  * @param {string} tokenURI - URI metadata trên IPFS
//  */
// exports.mintNFT = async (req, res) => {
//   try {
//     const { tokenURI } = req.body;
//     if (!tokenURI) {
//       return res.status(400).json({ error: "Missing tokenURI" });
//     }

//     const tx = await nftService.mintNFT(tokenURI);
//     res.json({ message: "NFT minted successfully", transaction: tx });
//   } catch (error) {
//     console.error("Error minting NFT:", error);
//     res.status(500).json({ error: "Failed to mint NFT" });
//   }
// };


/**
 * Lấy danh sách NFT của một tài khoản ví
 * @param {string} address - Địa chỉ ví
 */
exports.getNFTsByOwner = async (req, res) => {
  try {
    const { address } = req.params;
    if (!address) {
      return res.status(400).json({ error: "Missing address" });
    }

    const nfts = await nftService.getNFTsByOwner(address);
    res.json({ nfts });
  } catch (error) {
    console.error("Error fetching NFTs by owner:", error);
    res.status(500).json({ error: "Failed to fetch NFTs by owner" });
  }
};

/**
 * Lấy metadata của một NFT dựa trên tokenId
 * @param {number} tokenId - ID của NFT
 */
exports.getNFTMetadata = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const metadata = await nftService.getNFTMetadata(tokenId);
    res.json({ metadata });
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    res.status(500).json({ error: "Failed to fetch NFT metadata" });
  }
};

/**
 * Chuyển NFT từ người dùng này sang người dùng khác
 * @param {string} from - Địa chỉ người gửi
 * @param {string} to - Địa chỉ người nhận
 * @param {number} tokenId - ID của NFT
 */
exports.transferNFT = async (req, res) => {
  try {
    const { from, to, tokenId } = req.body;
    if (!from || !to || !tokenId) {
      return res.status(400).json({ error: "Missing from, to, or tokenId" });
    }

    const tx = await nftService.transferNFT(from, to, tokenId);
    res.json({ message: "NFT transferred successfully", transaction: tx });
  } catch (error) {
    console.error("Error transferring NFT:", error);
    res.status(500).json({ error: "Failed to transfer NFT" });
  }
};

// /**
//  * Upload metadata lên IPFS
//  * @param {object} metadata - Metadata của NFT
//  */
// exports.uploadMetadataToIPFS = async (req, res) => {
//   try {
//     const { metadata } = req.body;
//     if (!metadata) {
//       return res.status(400).json({ error: "No metadata provided" });
//     }

//     const ipfsHash = await nftService.uploadMetadataToIPFS(metadata);
//     res.json({ ipfsHash });
//   } catch (error) {
//     console.error("Error uploading metadata to IPFS:", error);
//     res.status(500).json({ error: "Failed to upload metadata to IPFS" });
//   }
// };
