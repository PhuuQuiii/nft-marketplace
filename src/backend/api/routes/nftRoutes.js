const express = require("express");
const {
  createNFT,
} = require("../controllers/nftController");

const router = express.Router();

// Route để tạo và niêm yết NFT
router.post("/createNFT", createNFT);

module.exports = router;
