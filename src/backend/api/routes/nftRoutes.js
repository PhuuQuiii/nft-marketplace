const express = require("express");
const {
  createNFT,
  updateNFT,
  getOwnedNFTs,
  updateNFTType,
} = require("../controllers/nftController");

const router = express.Router();

// Route để tạo và niêm yết NFT
router.post("/createNFT", createNFT);
router.post("/updateNFT", updateNFT);

// Route để lấy danh sách NFT ID của người dùng
router.get("/ownedNFTs/:owner", getOwnedNFTs);

router.post("/updateNFTType", updateNFTType);

module.exports = router;
