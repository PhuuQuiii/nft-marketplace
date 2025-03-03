import { useState } from "react";
import { Row, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios"; // Sử dụng axios để gọi API

// Tạo Component Create cho việc upload và tạo NFT
const Create = () => {
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
        const formData = new FormData();
        formData.append("file", file);
        const result = await axios.post("http://localhost:5000/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(result.data);
        setImage(`http://localhost:8080/ipfs/${result.data.ipfsHash}`); // Lưu đường dẫn ảnh từ IPFS
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };

  // Tạo NFT và đưa vào Marketplace
  const createNFT = async () => {
    if (!image || !price || !name || !description) return;
    try {
      const metadata = { image, price, name, description };
      const result = await axios.post("http://localhost:5000/upload", metadata);
      mintThenList(result.data.ipfsHash); // Mint NFT và đưa vào Marketplace
      setShowSuccessToast(true);  // Hiển thị thông báo thành công
      console.log("NFT created and listed!");
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  const mintThenList = async (ipfsHash) => {
    const uri = `http://localhost:8080/ipfs/${ipfsHash}`; // Lấy URI metadata từ IPFS
    console.log("URI:", uri);
    try {
      // Mint NFT
      const mintResponse = await axios.post("http://localhost:5000/nft/mint", { tokenURI: uri });
      const tokenId = mintResponse.data.tokenId;

      // Cấp quyền cho marketplace
      await axios.post("http://localhost:5000/nft/approve", { tokenId });

      const listingPrice = ethers.utils.parseEther(price.toString());
      await axios.post("http://localhost:5000/marketplace/list", {
        nftAddress: process.env.NFT_CONTRACT_ADDRESS,
        tokenId,
        price: listingPrice.toString(),
      });

      console.log("NFT Minted and Listed!");
    } catch (error) {
      console.error("Error in mintThenList:", error.message);  // In ra chi tiết lỗi
      if (error.response && error.response.data) {
        console.error("Error data:", error.response.data);  // In ra thông tin dữ liệu chi tiết nếu có
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