const express = require("express");
const { mintNFT, getNFTMetadata, transferNFT, uploadMetadataToIPFS } = require("../controllers/nftController");

const router = express.Router();

// Route để mint một NFT mới
router.post("/mint", mintNFT);

// Route để lấy thông tin chi tiết của một NFT
router.get("/:tokenId", getNFTMetadata);

// Route để chuyển NFT sang ví khác
router.post("/transfer", transferNFT);

// Route để upload metadata lên IPFS
router.post("/uploadMetadata", uploadMetadataToIPFS);

module.exports = router;