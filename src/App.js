import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Function to fetch balance
  const fetchBalance = async (selectedAccount) => {
    try {
      if (!selectedAccount) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(selectedAccount);
      setBalance(ethers.formatEther(balanceWei));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
  };

  // Function to connect MetaMask (with popup)
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      // Force MetaMask to show the popup
      await window.ethereum.request({ method: "wallet_requestPermissions", params: [{ eth_accounts: {} }] });

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await fetchBalance(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect to MetaMask. Please try again.");
    }
  };

  // Handle account changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await fetchBalance(accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  // Function to disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setIsConnected(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isConnected ? (
          <button onClick={connectWallet} className="App-link">
            Connect to Wallet
          </button>
        ) : (
          <div className="balance-container">
            <p>Connected: {account?.slice(0, 6)}...{account?.slice(-4)}</p>
            <p className="balance">Balance: {parseFloat(balance || "0").toFixed(4)} ETH</p>
            <button onClick={disconnectWallet} className="App-link">
              Disconnect
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
