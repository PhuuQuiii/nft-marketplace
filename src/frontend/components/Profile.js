import React, { useState, useEffect } from "react";
import { Card, Row, Col, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { ethers } from "ethers";
import axios from "axios";

// ABI của smart contract (rút gọn chỉ giữ các hàm cần thiết)
const contractABI = [
  "function getOwnedNFTs(address owner) external view returns (uint[] memory)",
  "function tokenURI(uint tokenId) external view returns (string memory)",
  "function updateTokenURI(uint tokenId, string calldata newTokenURI) external",
];

console.log(process.env.REACT_APP_NFT_CONTRACT_ADDRESS);
console.log(process.env.REACT_APP_IPFS_HOST);
const contractAddress = process.env.REACT_APP_NFT_CONTRACT_ADDRESS; // Địa chỉ của smart contract
//const contractAddress = '0x0DF63c9798Eb7b734F6E3DB244fC8b21A9c53387'; // Địa chỉ của smart contract

const ipfsGateway = process.env.REACT_APP_IPFS_HOST; // Gateway để truy cập IPFS
//const ipfsGateway = 'localhost'; // Gateway để truy cập IPFS

const Profile = ({ walletAddress, marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [nfts, setNfts] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

        console.log("contract", contract);

        // Lấy danh sách NFT ID của user
        const tokenIds = await contract.getOwnedNFTs(walletAddress);
        console.log("tokenIds", tokenIds);
        if (tokenIds.length === 0) {
          setNfts([]);
          setLoading(false);
          return;
        }

        // Lấy metadata từ IPFS cho từng NFT
        const nftData = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const tokenUri = await contract.tokenURI(tokenId);
            console.log("tokenUri", tokenUri);
            const ipfsUrl = tokenUri.replace("ipfs://", ipfsGateway); // Chuyển IPFS URI thành HTTP URL
            console.log("ipfsUrl", ipfsUrl);
            // Gọi API để lấy metadata JSON từ IPFS
            const metadataRes = await fetch(ipfsUrl);
            const metadata = await metadataRes.json();

            // Chuyển đổi đường dẫn ảnh IPFS thành HTTP URL
            const imageUrl = metadata.image.replace("ipfs://", ipfsGateway);

            console.log(metadata);
            return {
              id: tokenId.toString(),
              image: imageUrl,
              name: metadata.name || `NFT #${tokenId}`,
              attributes: metadata.attributes || [],
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

  const handleShowModal = (nft) => {
    setSelectedItem(nft); // Lưu thông tin NFT được chọn
    setShowModal(true); // Hiển thị modal
  };

  const handleCloseModal = () => {
    setShowModal(false); // Ẩn modal
  };

  const handleSell = async (tokenId) => {
    console.log(tokenId);
    try {
      // Cấp quyền cho marketplace quản lý NFT
      await (await nft.setApprovalForAll(marketplace.address, true)).wait();

      // Đặt giá cho NFT (giá này có thể được lấy từ một input hoặc giá mặc định)
      const price = prompt("Enter price in ETH for the NFT:"); // Yêu cầu người dùng nhập giá
      if (!price) return;

      const tokenUri = await nft.tokenURI(tokenId);
      const ipfsUrl = tokenUri.replace("ipfs://", ipfsGateway);
      const metadataRes = await fetch(ipfsUrl);
      const data = await metadataRes.json();
      const metadata = {
        type: data.type,
        image: data.image,
        name: data.name,
        attributes: data.attributes,
        price: data.price,
        tokenId: tokenId,
      };

      console.log(metadata);

      metadata.price = price;

      const result = await axios.post(
        "http://localhost:4000/nft/updateNFT",
        metadata
      );
      console.log(result);

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
      <h2 style={{ color: 'black', fontSize: '58px' }}>Your NFTs</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : nfts.length === 0 ? (
        <p style={{ color: 'black', fontSize: '48px' }}>No NFTs found</p>
      ) : (
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
          {nfts.map((nft) => (
            <Col key={nft.id} className="overflow-hidden">
              <div className='pixel-box'>
                <div className='pixel-box-inner'>
                  <div className='pixel-box-header'>
                    <h1>{nft.name}</h1>
                  </div>
                  <div>
                    <img
                      style={{
                        width: '95%',
                        height: '95%',
                        backgroundColor: 'lightblue',
                        clipPath: 'polygon(0 10px, 10px 10px, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 10px), 0 calc(100% - 10px))'
                      }}
                      src={nft.image} alt={nft.name} 
                      onClick={() => handleShowModal(nft)} // On click, show modal with item details
                    />
                  </div>
                  <Button className="btn-pixel border-0 mt-3" onClick={() => handleSell(nft.id)}>
                    Sell
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

    {selectedItem && (
      <Modal className='custom-modal' show={showModal} onHide={handleCloseModal}>
        <div className='pixel-box'>
          <Modal.Header className="border-0 pb-0" closeButton></Modal.Header>
          <div className='pixel-box-inner'>
            <Modal.Body>
              <div className='row'>
                {/* Cột hiển thị ảnh */}
                <div className='col-md-4 d-flex flex-column	 justify-content-center align-items-center'>
                  <h1>{selectedItem.name}</h1>
                  <img
                    style={{
                      width: '100%',
                      height: 'auto',
                      backgroundColor: 'lightblue',
                      clipPath: 'polygon(0 10px, 10px 10px, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 10px), 0 calc(100% - 10px))'
                    }}
                    src={selectedItem.image} 
                    alt={selectedItem.name} 
                  />
                </div>
                {/* Cột hiển thị nội dung */}
                <div className='col-md-7'>
                  <h1>Attributes:</h1>
                  <ul className="attributes-grid">
                    {Object.entries(selectedItem.attributes).map(([key, value], index) => (
                      <li key={index}>
                        <span className="attribute-key">{key}:</span> 
                        <span className="attribute-value">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className='border-0 justify-content-center'>
              <Button className="btn-pixel border-0 mt-3" onClick={() => handleSell(nft.id)}>
                Sell
              </Button>
            </Modal.Footer>
          </div>
        </div>
      </Modal>
    )}
    </div>
  );
};

export default Profile;
