import { useState } from "react";
import { Row, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios"; // Sử dụng axios để gọi API

// Tạo Component Create cho việc upload và tạo NFT
const Create = () => {
  const [image, setImage] = useState(""); // Dùng để lưu đường dẫn ảnh từ IPFS
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
        const result = await axios.post(
          "http://localhost:4000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
      const result = await axios.post("http://localhost:4000/nft/createNFT", metadata);
      setShowSuccessToast(true); // Hiển thị thông báo thành công
      console.log("NFT created and listed!", result.data);
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
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
          <Toast.Body> NFT created and listed successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Create;