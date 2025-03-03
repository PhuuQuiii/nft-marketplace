const marketplaceService = require("../services/marketplaceService");

/**
 * Đăng bán một NFT trên marketplace
 * @param {string} nftAddress - Địa chỉ hợp đồng NFT
 * @param {number} tokenId - ID của NFT
 * @param {string} price - Giá bán NFT (wei)
 */
const listNFTForSale = async (req, res) => {
  try {
    const { nftAddress, tokenId, price } = req.body;
    if (!nftAddress || !tokenId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await marketplaceService.listNFTForSale(
      nftAddress,
      tokenId,
      price
    );
    res.json(result);
  } catch (error) {
    console.error("Error listing NFT for sale:", error);
    res.status(500).json({ error: "Failed to list NFT for sale" });
  }
};

/**
 * Mua một NFT từ marketplace
 * @param {number} itemId - ID của Item cần mua
 * @param {string} price - Giá NFT (wei)
 */
const buyNFT = async (req, res) => {
  try {
    const { itemId, price } = req.body;
    if (!itemId || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const result = await marketplaceService.buyNFT(itemId, price);
    res.json(result);
  } catch (error) {
    console.error("Error buying NFT:", error);
    res.status(500).json({ error: "Failed to buy NFT" });
  }
};

/**
 * Lấy tổng giá tiền NFT cần thanh toán
 * @param {number} itemId - ID của Item
 */
const getTotalPrice = async (req, res) => {
  try {
    const { itemId } = req.params;
    const totalPrice = await marketplaceService.getTotalPrice(itemId);
    res.json({ totalPrice });
  } catch (error) {
    console.error("Error fetching total price:", error);
    res.status(500).json({ error: "Failed to fetch total price" });
  }
};

module.exports = { listNFTForSale, buyNFT, getTotalPrice };
