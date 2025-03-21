const express = require("express");
const {
  createNFT,
  updateNFT,
  getOwnedNFTs,
} = require("../controllers/nftController");

const router = express.Router();

// Route để tạo và niêm yết NFT
router.post("/createNFT", createNFT);
router.post("/updateNFT", updateNFT);

// Route để lấy danh sách NFT ID của người dùng
router.get("/ownedNFTs/:owner", getOwnedNFTs);

module.exports = router;
