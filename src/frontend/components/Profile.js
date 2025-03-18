import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert } from "react-bootstrap";
import { ethers } from "ethers";

// ABI của smart contract (rút gọn chỉ giữ các hàm cần thiết)
const contractABI = [
  "function getOwnedNFTs(address owner) external view returns (uint[] memory)",
  "function tokenURI(uint tokenId) external view returns (string memory)",
];

const contractAddress = "0x05aa3071e6F516525d3F6E94cc1B07A0E9B67494";

const ipfsGateway = "localhost:8080"; // Gateway để truy cập IPFS

const Profile = ({ walletAddress }) => {
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
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

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
