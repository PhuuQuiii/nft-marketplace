const express = require("express");
const {
  listNFTForSale,
  buyNFT,
  getTotalPrice
} = require("../controllers/marketplaceController");

const router = express.Router();

// Route để niêm yết NFT lên Marketplace
router.post("/list", listNFTForSale);

// Route để mua NFT từ Marketplace
router.post("/buy", buyNFT);

// Route để lấy tổng giá tiền NFT cần thanh toán
router.get("/totalPrice/:itemId", getTotalPrice);

module.exports = router;