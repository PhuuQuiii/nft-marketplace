import { useState } from "react";
import { Row, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import axios from "axios"; 

const Create = () => {
  const [type, setType] = useState("Quan");
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const result = await axios.post("http://localhost:4000/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setImage(`http://localhost:8080/ipfs/${result.data.ipfsHash}`);
      } catch (error) {
        console.log("IPFS image upload error: ", error);
      }
    }
  };

  const createNFT = async () => {
    if (!type || !image || !name || !description || !attributes) return;
    try {
      const metadata = { type, image, name, description, attributes };
      const result = await axios.post("http://localhost:4000/nft/createNFT", metadata);
      setShowSuccessToast(true);
      console.log("NFT created and listed!", result.data);
    } catch (error) {
      console.log("IPFS URI upload error: ", error);
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: "1000px" }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Select onChange={(e) => setType(e.target.value)} value={type}>
                <option value="Quan">Quan</option>
                <option value="Điền">Điền</option>
              </Form.Select>
              <Form.Control type="file" required name="file" onChange={uploadToIPFS} />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              {type === "Quan" ? (
                <>
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, color: e.target.value })} size="lg" type="text" placeholder="Color" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, health: e.target.value })} size="lg" type="number" placeholder="Health" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, attack: e.target.value })} size="lg" type="number" placeholder="Attack" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, armor: e.target.value })} size="lg" type="number" placeholder="Armor" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, speed: e.target.value })} size="lg" type="number" placeholder="Speed" />
                </>
              ) : (
                <>
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, landName: e.target.value })} size="lg" type="text" placeholder="Land Name" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, info: e.target.value })} size="lg" type="text" placeholder="Information" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, effect: e.target.value })} size="lg" type="text" placeholder="Effect" />
                  <Form.Control onChange={(e) => setAttributes({ ...attributes, stats: e.target.value })} size="lg" type="text" placeholder="Stats" />
                </>
              )}
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      <ToastContainer position="top-end">
        <Toast onClose={() => setShowSuccessToast(false)} show={showSuccessToast} delay={3000} autohide>
          <Toast.Body>NFT created and listed successfully!</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default Create;
