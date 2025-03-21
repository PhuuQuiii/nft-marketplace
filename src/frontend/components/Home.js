import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Card, Button } from 'react-bootstrap';

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  const loadMarketplaceItems = useCallback(async () => {
    try {
      if (!marketplace || !nft) {
        console.error('Marketplace or NFT contract is not initialized.');
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        console.error('No wallet connected. Please connect your wallet.');
        return;
      }

      const itemCount = await marketplace.callStatic.itemCount();
      let items = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await marketplace.items(i);
        if (!item.sold) {
          const uri = await nft.tokenURI(item.tokenId);
          const response = await fetch(uri);
          const metadata = await response.json();
          const totalPrice = await marketplace.getTotalPrice(item.itemId);

          console.log(metadata);
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            image: metadata.image,
            attributes: metadata.attributes,
          });
        }
      }

      setItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    }
  }, [marketplace, nft]); // Chỉ gọi lại khi `marketplace` hoặc `nft` thay đổi

  const buyMarketItem = async (item) => {
    try {
      if (!marketplace) {
        console.error('Marketplace contract is not initialized.');
        return;
      }

      await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait();
      loadMarketplaceItems();
    } catch (error) {
      console.error('Error purchasing item:', error);
    }
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, [loadMarketplaceItems]); // Sử dụng `useCallback` nên không bị thay đổi mỗi lần render

  if (loading)
    return (
      <main style={{ padding: '1rem 0' }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>{item.description}</Card.Text>
                  {Object.keys(item.attributes).length > 0 && (
                    <div>
                      <h6>Attributes:</h6>
                      <ul className="list-unstyled">
                        {Object.entries(item.attributes).map(([key, value], index) => (
                          <li key={index}>
                            {key}: {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                        Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: '1rem 0' }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
};

export default Home;
