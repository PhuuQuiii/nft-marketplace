import { useState, useEffect, useCallback } from 'react'
import { ethers } from "ethers"
import { Row, Col, Modal } from 'react-bootstrap'

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const loadPurchasedItems = useCallback(async () => {
    try {
      const filter = marketplace.filters.Bought(null, null, null, null, null, account)
      const results = await marketplace.queryFilter(filter)

      const purchases = await Promise.all(results.map(async (tx) => {
        try {
          const i = tx.args
          const uri = await nft.tokenURI(i.tokenId)
          const response = await fetch(uri)
          const metadata = await response.json()
          const totalPrice = await marketplace.getTotalPrice(i.itemId)

          return {
            totalPrice,
            price: i.price,
            itemId: i.itemId,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            attributes: metadata.attributes,
          }
        } catch (error) {
          console.error("Lỗi khi fetch metadata:", error)
          return null
        }
      }))

      setPurchases(purchases.filter(item => item !== null))
      setLoading(false)
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error)
      setLoading(false)
    }
  }, [marketplace, nft, account])

  useEffect(() => {
    loadPurchasedItems()
  }, [loadPurchasedItems])

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  const handleShowModal = (item) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
  }

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
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
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2 style={{ color: 'black', fontSize: '58px' }}>No purchases</h2>
        </main>
      )}
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
  )
}
