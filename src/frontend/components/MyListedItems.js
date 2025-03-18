import { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import { Card, Row, Col, Button } from "react-bootstrap";


function renderSoldItems(items) {
  return (
    <>
      <h2>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                For {ethers.utils.formatEther(item.totalPrice)} ETH - Received {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);

  const loadListedItems = useCallback(async () => {
    if (!marketplace || !nft || !account) {
      console.error("Marketplace, NFT contract, or account is not available.");
      return;
    }

    try {
      const itemCount = await marketplace.itemCount();
      let listedItems = [];
      let soldItems = [];

      for (let indx = 1; indx <= itemCount; indx++) {
        const i = await marketplace.items(indx);
        if (i.seller.toLowerCase() === account.toLowerCase()) {
          const uri = await nft.tokenURI(i.tokenId);
          const response = await fetch(uri);
          const metadata = await response.json();
          const totalPrice = await marketplace.getTotalPrice(i.itemId);

          let item = {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
          };

          listedItems.push(item);
          if (i.sold) soldItems.push(item);
        }
      }

      setListedItems(listedItems);
      setSoldItems(soldItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading listed items:", error);
      setLoading(false);
    }
  }, [marketplace, nft, account]); // Đảm bảo không bị re-render liên tục

  useEffect(() => {
    loadListedItems();
  }, [loadListedItems]); // Không bị lỗi dependency

  if (loading) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  }

  const handleCancelSell = (tokenId) => {
    // Thêm logic xử lý hủy bán NFT ở đây
    console.log(`Canceling sell for NFT with ID: ${tokenId}`);
  };

  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                  <div className="d-flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleCancelSell(nft.id)}
                    >
                      Cancel sell
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}
