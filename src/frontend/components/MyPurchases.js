import { useState, useEffect, useCallback } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card } from 'react-bootstrap'

export default function MyPurchases({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState([])

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

  return (
    <div className="flex justify-center">
      {purchases.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {purchases.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body>
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
                  <Card.Footer>{ethers.utils.formatEther(item.totalPrice)} ETH</Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No purchases</h2>
        </main>
      )}
    </div>
  )
}
