require("dotenv").config(); // Load biến môi trường từ .env
const express = require("express");
const cors = require("cors");
const { create: ipfsHttpClient } = require("ipfs-http-client"); // Import IPFS client
const nftRoutes = require("./routes/nftRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");
const fileUpload = require("express-fileupload");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(fileUpload()); 

// Lấy thông tin IPFS từ .env
const IPFS_HOST = process.env.IPFS_HOST || "localhost";
const IPFS_PORT = process.env.IPFS_PORT || 5001;
const IPFS_PROTOCOL = process.env.IPFS_PROTOCOL || "http";

// Kết nối tới IPFS node
const ipfs = ipfsHttpClient({
  host: IPFS_HOST,
  port: IPFS_PORT,
  protocol: IPFS_PROTOCOL,
});

// Route kiểm tra server
app.get("/", (req, res) => {
  res.send("NFT Marketplace API is running...");
});

// API để upload dữ liệu lên IPFS
app.post("/upload", async (req, res) => {
  try {
    const file = req.files.file; // Lấy file từ req.files

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Upload file lên IPFS
    const result = await ipfs.add(file.data);
    res.json({ ipfsHash: result.path });
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    res.status(500).json({ error: "Failed to upload to IPFS" });
  }
});

// Sử dụng các route cho NFT và Marketplace
app.use("/nft", nftRoutes);
app.use("/marketplace", marketplaceRoutes);

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
