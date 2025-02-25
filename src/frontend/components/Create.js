import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client"; // Dùng để upload dữ liệu lên IPFS (InterPlanetary File System).

// //  Kết nối với IPFS node thông qua Infura
// const projectId = "453b9b294b434c6abbfeb915bd15de17";
// const projectSecret = "oepZzE/puUpgERoPQhFxqie5f9SXCK1+Bkfr2EhDdQs+XTX4ZUYbxA";
// const auth =
//   "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// // Connect to IPFS node through Infura with authentication
// const client = ipfsHttpClient({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
//   headers: {
//     authorization: auth,
//   },
// });

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')


const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  //  Xử lý tải ảnh lên IPFS
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file); // upload file lên IPFS
        console.log(result);
        setImage(`https://ipfs.infura.io/ipfs/${result.path}`); // lưu vào image
      } catch (error) {
        console.log("ipfs image upload error: ", error);
      }
    }
  };
  // Tạo NFT và đưa vào Marketplace
  const createNFT = async () => {
    console.log("hello");
    if (!image || !price || !name || !description) return;
    try {
      const result = await client.add(
        JSON.stringify({ image, price, name, description })
      ); // Tạo metadata JSON cho NFT và tải nó lên IPFS
      mintThenList(result); // Mint NFT và đưa vào Marketplace
    } catch (error) {
      console.log("ipfs uri upload error: ", error);
    }
  };

  // Mint NFT và niêm yết trên Marketplace
  const mintThenList = async (result) => {
    // Lấy URI metadata từ IPFS
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // mint nft
    await (await nft.mint(uri)).wait();
    // Lấy tokenId của NFT vừa mint.
    const id = await nft.tokenCount();
    // Cấp quyền (setApprovalForAll) để marketplace có thể quản lý NFT này
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // List NFT trên marketplace với giá quy đổi sang ETH
    const listingPrice = ethers.utils.parseEther(price.toString());
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
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
                onChange={uploadToIPFS}
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
    </div>
  );
};

export default Create;
