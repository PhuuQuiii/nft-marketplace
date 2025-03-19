const express = require("express");
const {
  createNFT,
  updateNFT,
} = require("../controllers/nftController");

const router = express.Router();

// Route để tạo và niêm yết NFT
router.post("/createNFT", createNFT);
router.post("/updateNFT", updateNFT);

module.exports = router;
