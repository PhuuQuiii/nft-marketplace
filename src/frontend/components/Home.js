import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'

const Home = ({ marketplace, nft }) => {
  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true)
  // Danh sách các NFT đang được bán trên marketplace
  const [items, setItems] = useState([])

  // Lấy danh sách NFT chưa bán
  const loadMarketplaceItems = async () => {
    // Load tổng số lượng item trên marketplace
    const itemCount = await marketplace.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i)
      if (!item.sold) {
        // Lấy URI metadata từ smart contract NFT
        const uri = await nft.tokenURI(item.tokenId)
        // Fetch metadata từ IPFS
        const response = await fetch(uri)
        const metadata = await response.json()
        // Lấy giá tổng cộng (giá item + phí)
        const totalPrice = await marketplace.getTotalPrice(item.itemId)
        // Thêm vào danh sách items
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
      }
    }
    setLoading(false)
    setItems(items)
  }

  // Mua NFT từ marketplace
  const buyMarketItem = async (item) => {
    // Truyền vào itemId của NFT cần mua và số tiền totalPrice bằng value
    await (await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })).wait()
    loadMarketplaceItems() // // Load lại danh sách NFT sau khi mua
  }

  useEffect(() => {
    loadMarketplaceItems() // tải danh sách NFT.
  }, [])
  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <div className='d-grid'>
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
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default Home