import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import './App.css';

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal state
  const [selectedItem, setSelectedItem] = useState(null); // Store the selected item for modal display

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

          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            image: metadata.image,
            attributes: metadata.attributes,
            description: metadata.description,
          });
        }
      }

      setItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    }
  }, [marketplace, nft]);

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

  const handleShowModal = (item) => {
    setSelectedItem(item);  // Store the selected item
    setShowModal(true); // Show modal
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  useEffect(() => {
    loadMarketplaceItems();
  }, [loadMarketplaceItems]);

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
                <div className='pixel-box'>
                  <div className='pixel-box-inner'>
                    <div className='pixel-box-header'>
                      <h1>{item.name}</h1>
                    </div>
                    <div>
                      <img
                        style={{
                          width: '95%',
                          height: '95%',
                          backgroundColor: 'lightblue',
                          clipPath: 'polygon(0 10px, 10px 10px, 10px 0, calc(100% - 10px) 0, calc(100% - 10px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 10px), 0 calc(100% - 10px))'
                        }}
                        src={item.image} alt={item.name} 
                        onClick={() => handleShowModal(item)} // On click, show modal with item details
                      />
                    </div>
                    <Button className="btn-pixel border-0 mt-3" onClick={() => buyMarketItem(item)}>
                      Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: '1rem 0' }}>
          <h2>No listed assets</h2>
        </main>
      )}

      {/* Modal Component */}
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
              <Button className='btn-pixel border-0' onClick={() => buyMarketItem(selectedItem)}>
                Buy for {ethers.utils.formatEther(selectedItem.totalPrice)} ETH
              </Button>
            </Modal.Footer>
          </div>
        </div>
      </Modal>
    )}
    </div>
  );
};

export default Home;
