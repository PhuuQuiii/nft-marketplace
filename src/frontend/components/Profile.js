import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Row, Col } from "react-bootstrap";

const Profile = ({ walletAddress }) => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/nft/owner/${walletAddress}`);
        setNfts(response.data.nfts);
      } catch (error) {
        console.error("Error fetching NFTs:", error);
      }
    };

    if (walletAddress) {
      fetchNFTs();
    }
  }, [walletAddress]);

  return (
    <div className="container mt-5">
      <h2>Your NFTs</h2>
      <Row>
        {nfts.map((nft, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={nft.image} />
              <Card.Body>
                <Card.Title>{nft.name}</Card.Title>
                <Card.Text>{nft.description}</Card.Text>
                <Card.Text>Price: {nft.price} ETH</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Profile;