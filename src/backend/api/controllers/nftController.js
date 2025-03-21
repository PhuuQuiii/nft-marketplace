const nftService = require("../services/nftService");
const { ethers } = require("ethers");

/**
 * Tạo NFT và niêm yết lên chợ
 * @param {object} metadata - Metadata của NFT
 */
exports.createNFT = async (req, res) => {
  try {
    const { type, image, name, attributes } = req.body;
    if (!type || !image || !name || !attributes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let metadata;
    if (type === "Quan") {
      metadata = {
        type,
        image,
        name,
        attributes: {
          color: attributes.color,
          health: attributes.health,
          attack: attributes.attack,
          armor: attributes.armor,
          speed: attributes.speed,
          effect1: attributes.effect1,
          critical: attributes.critical,
          effect2: attributes.effect2,
          effect3: attributes.effect3,
        },
      };
    } else if (type === "Điền") {
      metadata = {
        type,
        image,
        name,
        attributes: {
          info: attributes.info,
          effect: attributes.effect,
          stats: attributes.stats,
        },
      };
    } else {
      return res.status(400).json({ error: "Invalid NFT type" });
    }

    // Upload metadata lên IPFS
    const ipfsHash = await nftService.uploadMetadataToIPFS(metadata);
    const uri = `http://localhost:8080/ipfs/${ipfsHash}`;

    // Mint NFT
    const mintTransaction = await nftService.mintNFT(uri);
    const mintReceipt = await mintTransaction.wait();

    // Kiểm tra sự kiện và lấy tokenId
    let tokenId;
    if (mintReceipt.events && mintReceipt.events.length > 0) {
      tokenId = mintReceipt.events[0].args.tokenId.toString();
    } else {
      // Nếu không có sự kiện, lấy tokenId từ transaction
      tokenId = await nftService.getTokenIdFromTransaction(mintTransaction);
    }

    res.json({ message: "NFT created successfully", tokenId });
  } catch (error) {
    console.error("Error creating NFT:", error);
    res.status(500).json({ error: "Failed to create NFT" });
  }
};

exports.updateNFT = async (req, res) => {
  try {
    const { tokenId, type, image, name, attributes, price } = req.body;
    if (!tokenId || !type || !image || !name || !attributes || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let metadata;
    if (type === "Quan") {
      metadata = {
        type,
        image,
        name,
        price,
        attributes: {
          color: attributes.color,
          health: attributes.health,
          attack: attributes.attack,
          armor: attributes.armor,
          speed: attributes.speed,
          effect1: attributes.effect1,
          critical: attributes.critical,
          effect2: attributes.effect2,
          effect3: attributes.effect3,
        },
      };
    } else if (type === "Điền") {
      metadata = {
        type,
        image,
        name,
        price,
        attributes: {
          info: attributes.info,
          effect: attributes.effect,
          stats: attributes.stats,
        },
      };
    } else {
      return res.status(400).json({ error: "Invalid NFT type" });
    }

    // Upload metadata lên IPFS
    const ipfsHash = await nftService.uploadMetadataToIPFS(metadata);
    const uri = `http://localhost:8080/ipfs/${ipfsHash}`;

    // Update NFT
    const updateTransaction = await nftService.updateTokenURI(tokenId, uri);
    await updateTransaction.wait();

    res.json({ message: "NFT updated successfully" });
  } catch (error) {
    console.error("Error updating NFT:", error);
    res.status(500).json({ error: "Failed to update NFT" });
  }
};

/**
 * Lấy danh sách NFT ID của người dùng
 * @param {object} req - Đối tượng yêu cầu
 * @param {object} res - Đối tượng phản hồi
 */
exports.getOwnedNFTs = async (req, res) => {
  try {
    const owner = req.params.owner; // Lấy địa chỉ ví từ tham số URL
    if (!owner) {
      return res.status(400).json({ error: "Missing owner address" });
    }

    // Gọi hàm từ nftService để lấy danh sách NFT ID
    const tokenIds = await nftService.getOwnedNFTs(owner);

    // Lấy token URI cho từng token ID và chuyển đổi sang ipfsUrl
    const ipfsUrls = await Promise.all(
      tokenIds.map(async (tokenId) => {
        const tokenUri = await nftService.nftContract.tokenURI(tokenId); // Lấy token URI từ smart contract
        const ipfsUrl = tokenUri.replace("ipfs://", process.env.IPFS_GATEWAY); // Chuyển đổi IPFS URI thành HTTP URL
        return ipfsUrl; // Trả về ipfsUrl
      })
    );

    res.json({ tokenIds, ipfsUrls }); // Trả về danh sách NFT ID và ipfsUrl
  } catch (error) {
    console.error("Error fetching owned NFTs:", error);
    res.status(500).json({ error: "Failed to fetch owned NFTs" });
  }
};
