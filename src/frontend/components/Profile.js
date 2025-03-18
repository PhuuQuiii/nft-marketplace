import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { ethers } from "ethers";

// ABI của smart contract (rút gọn chỉ giữ các hàm cần thiết)
const contractABI = [
  "function getOwnedNFTs(address owner) external view returns (uint[] memory)",
  "function tokenURI(uint tokenId) external view returns (string memory)",
];

console.log(process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
console.log(process.env.REACT_APP_IPFS_HOST);
const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS; // Địa chỉ của smart contract

const ipfsGateway = process.env.REACT_APP_IPFS_HOST; // Gateway để truy cập IPFS

const Profile = ({ walletAddress, marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!walletAddress || !window.ethereum) {
        setError("Wallet not connected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        // Lấy danh sách NFT ID của user
        const tokenIds = await contract.getOwnedNFTs(walletAddress);
        if (tokenIds.length === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        // Lấy metadata từ IPFS cho từng NFT
        const nftData = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const tokenUri = await contract.tokenURI(tokenId);
            const ipfsUrl = tokenUri.replace("ipfs://", ipfsGateway); // Chuyển IPFS URI thành HTTP URL

            // Gọi API để lấy metadata JSON từ IPFS
            const metadataRes = await fetch(ipfsUrl);
            const metadata = await metadataRes.json();

            // Chuyển đổi đường dẫn ảnh IPFS thành HTTP URL
            const imageUrl = metadata.image.replace("ipfs://", ipfsGateway);

            return {
              id: tokenId.toString(),
              image: imageUrl,
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || "No description available",
            };
          })
        );

        setNfts(nftData);
      } catch (err) {
        setError("Failed to fetch NFTs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress]);

  const handleSell = async (tokenId) => {
    console.log(tokenId)
    try {
      // Cấp quyền cho marketplace quản lý NFT
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();

      // Đặt giá cho NFT (giá này có thể được lấy từ một input hoặc giá mặc định)
      const price = prompt("Enter price in ETH for the NFT:"); // Yêu cầu người dùng nhập giá
      if (!price) return;

      // Niêm yết NFT trên marketplace
      const listingPrice = ethers.utils.parseEther(price.toString());
      await (
        await marketplace.makeItem(nft.address, tokenId, listingPrice)
      ).wait();

      console.log(
        `NFT with ID: ${tokenId} has been listed for sale at ${price} ETH`
      );
    } catch (error) {
      console.error("Error selling NFT:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Your NFTs</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : nfts.length === 0 ? (
        <p>No NFTs found</p>
      ) : (
        <Row>
          {nfts.map((nft) => (
            <Col key={nft.id} md={4} className="mb-4">
              <Card>
                <Card.Img variant="top" src={nft.image} alt={`NFT ${nft.id}`} />
                <Card.Body>
                  <Card.Title>{nft.name}</Card.Title>
                  <Card.Text>{nft.description}</Card.Text>
                  <Card.Text>Token ID: {nft.id}</Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={() => handleSell(nft.id)}
                    >
                      Sell
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Profile;
