import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client"; // Dùng để upload dữ liệu lên IPFS

// Cấu hình kết nối tới IPFS node của bạn (IPFS Docker)
const client = ipfsHttpClient({
  host: "localhost",  // Đảm bảo rằng sử dụng localhost cho IPFS Docker container
  port: 5001,         // Cổng API của IPFS
  protocol: "http",   // Giao thức HTTP (sử dụng HTTP thay vì HTTPS trong phát triển)
});

// Tạo Component Create cho việc upload và tạo NFT
const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState("");  // Dùng để lưu đường dẫn ảnh từ IPFS
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false); // Trạng thái cho toast thông báo thành công
  
  
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file); // Upload file lên IPFS
        console.log(result);
        setImage(`http://localhost:8080/ipfs/${result.path}`); // Lưu đường dẫn ảnh từ IPFS
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };

  // Tạo NFT và đưa vào Marketplace
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const result = await client.add(
        JSON.stringify({ image, price, name, description })
      ); // Tạo metadata JSON cho NFT và tải nó lên IPFS
      mintThenList(result); // Mint NFT và đưa vào Marketplace
      setShowSuccessToast(true);  // Hiển thị thông báo thành công
      console.log("NFT created and listed!");
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  const mintThenList = async (result) => {
    const uri = `http://localhost:8080/ipfs/${result.path}`; // Lấy URI metadata từ IPFS
    console.log("URI:", uri);
    try {
      // Mint NFT
      const mintTransaction = await nft.mint(uri);
      const mintReceipt = await mintTransaction.wait();  // Đợi giao dịch mint hoàn tất
  
      // Kiểm tra tokenCount sau khi mint
      const id = await nft.tokenCount();  // Đảm bảo rằng tokenCount được gọi sau khi mint thành công
      console.log("Token Count:", id.toString());  // In ra token count
  
      // Cấp quyền cho marketplace
      const approvalTransaction = await nft.setApprovalForAll(marketplace.address, true);
      await approvalTransaction.wait();
  
      const listingPrice = ethers.utils.parseEther(price.toString());
      const listingTransaction = await marketplace.makeItem(nft.address, id, listingPrice);
      await listingTransaction.wait();
  
      console.log("NFT Minted and Listed!");
    } catch (error) {
      console.error("Error in mintThenList:", error.message);  // In ra chi tiết lỗi
      if (error.data) {
        console.error("Error data:", error.data);  // In ra thông tin dữ liệu chi tiết nếu có
      }
    }
  };
  
  
  
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS} // Xử lý tải ảnh lên IPFS
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>

      {/* Toast Container for Success Message */}
      <ToastContainer position="top-end">
        <Toast
          onClose={() => setShowSuccessToast(false)}
          show={showSuccessToast}
          delay={3000}
          autohide
        >
          <Toast.Body>🎉 NFT created and listed successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Create;
