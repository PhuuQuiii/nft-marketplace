import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Card, Row, Col, Button, Modal } from "react-bootstrap";
import './App.css';

const RenderSoldItems = ({ items }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="px-5 py-3 container">
      <h2 style={{ color: 'black', fontSize: '58px' }}>Sold</h2>
      <Row xs={1} md={2} lg={4} className="g-4 py-3">
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <div className="pixel-box">
              <div className="pixel-box-inner">
                <div className="pixel-box-header">
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
                    src={item.image}
                    alt={item.name}
                    onClick={() => handleShowModal(item)}
                  />
                  <div>{ethers.utils.formatEther(item.totalPrice)} ETH</div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {selectedItem && (
        <Modal className="custom-modal" show={showModal} onHide={handleCloseModal}>
          <div className="pixel-box">
            <Modal.Header className="border-0 pb-0" closeButton></Modal.Header>
            <div className="pixel-box-inner">
              <Modal.Body>
                <div className="row">
                  <div className="col-md-4 d-flex flex-column justify-content-center align-items-center">
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
                  <div className="col-md-7">
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
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};


export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
            attributes: metadata.attributes,
          };

          if (i.sold){
            soldItems.push(item);
          } else {
            listedItems.push(item);
          }  
        }
      }
      setSoldItems(soldItems);
      setListedItems(listedItems);
      setLoading(false);
    } catch (error) {
      console.error("Error loading listed items:", error);
      setLoading(false);
    }
  }, [marketplace, nft, account]); // Đảm bảo không bị re-render liên tục

  useEffect(() => {
    loadListedItems();
    console.log("listed items: ", listedItems);
    console.log("sold items: ", soldItems);

  }, [loadListedItems]); // Không bị lỗi dependency

  const handleCancelSell = async (itemId) => {
    try {
      if (!marketplace) {
        console.error("Marketplace contract is not initialized.");
        return;
      }

      // Gọi hàm cancelItem từ hợp đồng Marketplace
      const transaction = await marketplace.cancelItem(itemId);
      await transaction.wait(); // Chờ giao dịch hoàn tất

      console.log(`Cancelled sell for item ID: ${itemId}`);
      loadListedItems(); // Tải lại danh sách để cập nhật
    } catch (error) {
      console.error("Error canceling sell:", error);
    }
  };

  const handleShowModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  if (loading) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2 style={{ color: 'black', fontSize: '58px'}}>Listed</h2>
          <Row xs={1} md={2} lg={4} className="g-4 py-3">
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <div className="pixel-box">
                  <div className="pixel-box-inner">
                    <div className="pixel-box-header">
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
                      <div>
                        {ethers.utils.formatEther(item.totalPrice)} ETH
                      </div>
                      <Button className="btn-pixel border-0 mt-3" onClick={() => handleCancelSell(item.itemId)}>
                        Cancel sell
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
          </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2 style={{ color: 'black', fontSize: '58px'}}>No listed assets</h2>
        </main>
      )
      }
          {soldItems.length > 0 ? (
            console.log("sold: ", soldItems),
            <RenderSoldItems items={soldItems} />
          ) :
            (
              console.log("No sold items")
          )
          }
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
              <Button className="btn-pixel border-0 mt-3" onClick={() => handleCancelSell(selectedItem.itemId)}>
                Cancel sell
              </Button>
            </Modal.Footer>
          </div>
        </div>
      </Modal>
    )}
    </div>
  );
}
