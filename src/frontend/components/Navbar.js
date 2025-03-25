import {
    Link
} from "react-router-dom";
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import bao from './logo bao.jpg'
import './App.css'; 
import { ethers } from "ethers";
const Navigation = ({ web3Handler, account }) => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const fetchBalance = async () => {
            if (!account) return;
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(account);
            setBalance(ethers.utils.formatEther(balance));
        }
        fetchBalance();
    }, [account]);
    return (
        <Navbar expand="lg" className="header" variant="dark">
            <Container>
                <Navbar.Brand style={{ fontSize: "28px"}} href="https://www.facebook.com/ngyen.qui.9/">
                    <img src={bao} width="40" height="40" className="" alt="" />
                    &nbsp; Marketplace BASO
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto gap-3">
                        <Nav.Link className="btn-pixel" as={Link} to="/">Home</Nav.Link>
                        <Nav.Link className="btn-pixel" as={Link} to="/create">Create</Nav.Link>
                        <Nav.Link className="btn-pixel" as={Link} to="/my-listed-items">My Listed Items</Nav.Link>
                        <Nav.Link className="btn-pixel" as={Link} to="/my-purchases">My Purchases</Nav.Link>
                        <Nav.Link className="btn-pixel" as={Link} to="/Profile">Profile</Nav.Link>
                    </Nav>
                    <Nav>
                        {account ? (
                            <>
                                <Nav.Link className="button nav-button btn-sm mx-4">
                                    <Button className="btn-pixel">
                                        {parseFloat(balance).toFixed(4)} ETH
                                    </Button>
                                </Nav.Link>   
                             </>                        
                        ) : (
                            <Button style={{color: '#28248C'}} onClick={web3Handler} variant="outline-light">Connect Wallet</Button>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )

}

export default Navigation;