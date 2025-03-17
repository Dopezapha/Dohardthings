"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { AppConfig, UserSession, showConnect } from "@stacks/connect"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import FlashLoan from "./components/FlashLoan"
import Deposit from "./components/Deposit"
import Withdraw from "./components/Withdraw"
import Governance from "./components/Governance"
import AdminPanel from "./components/AdminPanel"
import { extractStacksAddress } from "./utils/stacks-auth"
import "./App.css"

const App = () => {
  const [account, setAccount] = useState(null)
  const [balance, setBalance] = useState(0)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialize Stacks authentication with correct scopes
  const appConfig = useMemo(() => new AppConfig(["store_write", "publish_data"]), [])
  const userSession = useMemo(() => new UserSession({ appConfig }), [appConfig])

  // Make userSession available globally
  useEffect(() => {
    window.userSession = userSession
  }, [userSession])

  // Define appDetails with better app icon handling
  const appDetails = useMemo(
    () => ({
      name: "FlashLend Protocol",
      icon: window.location.origin + "/logo.png",
    }),
    [],
  )

  // Improved balance fetching function
  const fetchUserBalance = useCallback(async (address) => {
    if (!address) return

    setIsLoading(true)
    try {
      // Direct API call is more reliable for getting balance
      const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`)

      if (!response.ok) {
        throw new Error("Failed to fetch balance from API")
      }

      const data = await response.json()

      if (data && data.stx && data.stx.balance) {
        // Convert from microSTX to STX (1 STX = 1,000,000 microSTX)
        const stxBalance = Number.parseInt(data.stx.balance) / 1000000
        setBalance(stxBalance)
        console.log("Fetched balance:", stxBalance)
      } else {
        throw new Error("Invalid balance data structure")
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      setError("Failed to fetch wallet balance: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check authentication status on app load
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      try {
        const userData = userSession.loadUserData()
        const address = extractStacksAddress(userData)

        if (address) {
          console.log("User is signed in with address:", address)
          setAccount(address)
          setIsConnected(true)
          fetchUserBalance(address)
        } else {
          console.log("User is signed in but address not found")
          setError("Wallet address not found in user data. Please reconnect.")
          userSession.signUserOut()
          setIsConnected(false)
        }
      } catch (err) {
        console.error("Error checking authentication status:", err)
        setError("Error loading user data: " + err.message)
        userSession.signUserOut()
        setIsConnected(false)
      }
    } else {
      console.log("User is not signed in")
      setIsConnected(false)
    }
  }, [userSession, fetchUserBalance])

  const openWalletModal = () => {
    setWalletModalOpen(true)
    setError(null) // Clear any previous errors when opening the modal
  }

  const closeWalletModal = () => {
    setWalletModalOpen(false)
  }

  // Improved connect wallet function with proper auth flow
  const connectWallet = () => {
    setError(null)
    setIsLoading(true)

    try {
      // Force new authentication to ensure signing prompt appears
      userSession.signUserOut() // Clear any existing session

      const authOptions = {
        appDetails,
        redirectTo: "/",
        onFinish: () => {
          try {
            if (userSession.isUserSignedIn()) {
              const userData = userSession.loadUserData()
              const address = extractStacksAddress(userData)

              if (address) {
                console.log("Wallet connected successfully:", address)
                setAccount(address)
                setIsConnected(true)
                fetchUserBalance(address)
                closeWalletModal()
              } else {
                console.error("Authentication finished but address not found")
                setError("Wallet connection failed: Address not found in user data. Please check console for details.")
              }
            } else {
              console.error("Authentication finished but user not signed in")
              setError("Wallet connection failed. Please try again.")
            }
          } catch (err) {
            console.error("Error in onFinish:", err)
            setError("Error processing authentication: " + err.message)
          } finally {
            setIsLoading(false)
          }
        },
        onCancel: () => {
          console.log("User cancelled authentication")
          setError("Wallet connection cancelled")
          setIsLoading(false)
        },
        userSession,
      }

      // This should trigger the wallet popup
      showConnect(authOptions)
    } catch (err) {
      console.error("Error initiating wallet connection:", err)
      setError("Failed to initiate wallet connection: " + err.message)
      setIsLoading(false)
    }
  }

  const disconnectWallet = () => {
    userSession.signUserOut()
    setAccount(null)
    setBalance(0)
    setIsConnected(false)
    console.log("Wallet disconnected")
  }

  return (
    <Router>
      <div className="app">
        <Header
          account={account}
          balance={balance}
          openWalletModal={openWalletModal}
          disconnectWallet={disconnectWallet}
          isLoading={isLoading}
          isConnected={isConnected}
        />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            {error && <div className="error-message">{error}</div>}
            <Routes>
              <Route path="/" element={<Dashboard account={account} />} />
              <Route path="/flash-loan" element={<FlashLoan account={account} />} />
              <Route path="/deposit" element={<Deposit account={account} />} />
              <Route path="/withdraw" element={<Withdraw account={account} />} />
              <Route path="/governance" element={<Governance account={account} />} />
              <Route path="/admin" element={<AdminPanel account={account} />} />
            </Routes>
          </main>
        </div>

        {walletModalOpen && (
          <div className="wallet-modal-overlay" onClick={closeWalletModal}>
            <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="wallet-modal-header">
                <h2>Connect Wallet</h2>
                <button className="wallet-modal-close" onClick={closeWalletModal}>
                  ×
                </button>
              </div>
              <div className="wallet-content">
                <p>
                  Connect your Stacks wallet to use the FlashLend Protocol. This will require you to sign a message to
                  verify your identity.
                </p>
                <div className="wallet-options">
                  <div className="wallet-option" onClick={connectWallet}>
                    <div className="wallet-icon hiro-icon"></div>
                    <span>Hiro Wallet</span>
                  </div>
                  <div className="wallet-option" onClick={connectWallet}>
                    <div className="wallet-icon xverse-icon"></div>
                    <span>Xverse Wallet</span>
                  </div>
                  <div className="wallet-option" onClick={connectWallet}>
                    <div className="wallet-icon leather-icon"></div>
                    <span>Leather Wallet</span>
                  </div>
                </div>
                {isLoading && (
                  <div className="loading" style={{ height: "50px" }}>
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App