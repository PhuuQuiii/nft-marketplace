import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./Navbar";
import Home from "./Home.js";
import Create from "./Create.js";
import MyListedItems from "./MyListedItems.js";
import MyPurchases from "./MyPurchases.js";
import Profile from "./Profile";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Spinner } from "react-bootstrap";

import "./App.css";

function App() {
  // Biến trạng thái chờ kết nối MetaMask
  const [loading, setLoading] = useState(true);
  // Lưu địa chỉ ví MetaMask của user.
  const [account, setAccount] = useState(null);
  // Đối tượng chứa hợp đồng NFT
  const [nft, setNFT] = useState({});
  // Đối tượng chứa hợp đồng Marketplace
  const [marketplace, setMarketplace] = useState({});

  useEffect(() => {
    const savedAccount = localStorage.getItem("userAccount");
    if (savedAccount) {
      setAccount(savedAccount);
      web3Handler(); // Tự động kết nối lại MetaMask
    }
  }, []);
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts", // Yêu cầu người dùng kết nối MetaMask
    });

    setAccount(accounts[0]); // Lưu địa chỉ ví vào state
    localStorage.setItem("userAccount", accounts[0]); // Lưu vào localStorage
    // provider: Dùng để giao tiếp với blockchain từ trình duyệt.
    const provider = new ethers.providers.Web3Provider(window.ethereum); 
    // Set signer
    const signer = provider.getSigner(); // Lấy quyền ký giao dịch (được cấp bởi MetaMask).

    // Khi người dùng đổi mạng Ethereum, ứng dụng sẽ tự reload lại trang
    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });
    // Khi người dùng đổi tài khoản MetaMask, app sẽ cập nhật lại ví mới.
    window.ethereum.on("accountsChanged", async function (accounts) {
      setAccount(accounts[0]);
      localStorage.setItem("userAccount", accounts[0]);
      await web3Handler();
    });
    loadContracts(signer);
  };
  const loadContracts = async (signer) => {
    // Tạo hợp đồng Marketplace bằng ethers.Contract()
    const marketplace = new ethers.Contract( 
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);
    // // Tạo hợp đồng NFT bằng ethers.Contract()
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    setNFT(nft);
    
    setLoading(false); // tắt spinner loading
  };

  return (
    <BrowserRouter>
      <div className="App"> 
        <>
          <Navigation web3Handler={web3Handler} account={account} /> 
        </>
        <div>
          {loading ? ( 
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "80vh",
              }}
            >
              <Spinner animation="border" style={{ display: "flex" }} />
              <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route
                path="/"
                element={<Home marketplace={marketplace} nft={nft} />}
              />
              <Route
                path="/create"
                element={<Create marketplace={marketplace} nft={nft} />}
              />
              <Route
                path="/my-listed-items"
                element={
                  <MyListedItems
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />
              <Route
                path="/my-purchases"
                element={
                  <MyPurchases
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                  />
                }
              />
              <Route
                path="/profile"
                element={<Profile walletAddress={account} marketplace={marketplace} nft={nft} />}
              />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
