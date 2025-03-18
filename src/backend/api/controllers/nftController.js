const nftService = require("../services/nftService");
const { ethers } = require("ethers");

/**
 * Tạo NFT và niêm yết lên chợ
 * @param {object} metadata - Metadata của NFT
 */
exports.createNFT = async (req, res) => {
  try {
    const { type, image, name, description, attributes } = req.body;
    if (!type || !image || !name || !description || !attributes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let metadata;
    if (type === "Quan") {
      metadata = {
        image,
        name,
        description,
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
        image,
        name,
        description,
        attributes: {
          landName: attributes.landName,
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
    const tokenId = mintReceipt.events[0].args.tokenId.toString();

    res.json({ message: "NFT created successfully", tokenId });
  } catch (error) {
    console.error("Error creating NFT:", error);
    res.status(500).json({ error: "Failed to create NFT" });
  }
};

