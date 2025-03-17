"use client"

import { useState, useEffect, useCallback } from "react"
import { getTotalLiquidity, getFlashLoanFee, getUserProtocolData } from "../utils/contract-calls"

const Dashboard = ({ account }) => {
  const [totalLiquidity, setTotalLiquidity] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [flashLoanFee, setFlashLoanFee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userData, setUserData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [contractStatus, setContractStatus] = useState({ deployed: true, checking: true })

  // Fetch protocol data from smart contract
  const fetchProtocolData = useCallback(async () => {
    if (!account) return

    setError(null)

    try {
      // Check if contract exists first
      if (!contractStatus.deployed && !contractStatus.checking) {
        setTotalLiquidity(0)
        setFlashLoanFee(0)
        setUserData(null)
        return
      }

      // Call the contract read-only functions one at a time to avoid overwhelming the API
      const liquidityValue = await getTotalLiquidity()
      setTotalLiquidity(liquidityValue)
      setContractStatus({ deployed: true, checking: false })

      const feeValue = await getFlashLoanFee()
      setFlashLoanFee(feeValue)

      // Get user's protocol data
      const userDataResult = await getUserProtocolData(account)
      setUserData(userDataResult)
    } catch (err) {
      console.error("Error fetching protocol data:", err)
      
      // Check if this is a contract not found error
      if (err.message && err.message.includes("NoSuchContract")) {
        setContractStatus({ deployed: false, checking: false })
        setError("Contract not deployed or not accessible. Please check contract deployment status.")
      } else {
        setError(`Failed to fetch protocol data: ${err.message || "Unknown error"}`)
      }
    }
  }, [account, contractStatus])

  // Fetch user wallet balance
  const fetchUserBalance = useCallback(async () => {
    if (!account) {
      setUserBalance(0)
      return
    }

    try {
      // Add a small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))

      const response = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${account}/balances`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data && data.stx && data.stx.balance) {
        // Convert from microSTX to STX (1 STX = 1,000,000 microSTX)
        const stxBalance = Number.parseInt(data.stx.balance) / 1000000
        setUserBalance(stxBalance)
      } else {
        throw new Error("Invalid balance data structure")
      }
    } catch (err) {
      console.error("Error fetching user balance:", err)
      setError(`Failed to fetch wallet balance: ${err.message || "Unknown error"}`)
    }
  }, [account])

  // Fetch all data on component mount and when account changes
  useEffect(() => {
    let isMounted = true

    const fetchAllData = async () => {
      if (!isMounted) return

      setLoading(true)

      try {
        // Fetch data sequentially to avoid overwhelming the API
        await fetchUserBalance()
        if (isMounted) await fetchProtocolData()

        if (isMounted) {
          setLoading(false)
          setLastUpdated(new Date())
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error in fetchAllData:", err)
          setLoading(false)
          setError(`Failed to fetch data: ${err.message || "Unknown error"}`)
        }
      }
    }

    if (account) {
      fetchAllData()

      // Set up interval for real-time updates (every 30 seconds)
      const intervalId = setInterval(() => {
        if (isMounted) fetchAllData()
      }, 30000)

      // Clean up interval on component unmount
      return () => {
        isMounted = false
        clearInterval(intervalId)
      }
    } else {
      setLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [account, fetchProtocolData, fetchUserBalance])

  // Refresh all data manually
  const refreshData = () => {
    setLoading(true)
    setError(null)
    setContractStatus({ deployed: true, checking: true }) // Reset contract status to check again

    // Fetch data sequentially
    fetchUserBalance()
      .then(() => fetchProtocolData())
      .then(() => {
        setLoading(false)
        setLastUpdated(new Date())
      })
      .catch((err) => {
        console.error("Error refreshing data:", err)
        setLoading(false)
        setError(`Failed to refresh data: ${err.message || "Unknown error"}`)
      })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={refreshData} className="refresh-btn" disabled={loading}>
          {loading ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!contractStatus.deployed && !contractStatus.checking && (
        <div className="warning-message">
          <p>
            <strong>Contract Not Found:</strong> The FlashLend contract could not be found at the specified address. 
            Please check if the contract has been deployed correctly.
          </p>
        </div>
      )}

      {!account ? (
        <div className="connect-wallet-prompt">
          <p>Please connect your wallet to view your dashboard data.</p>
        </div>
      ) : (
        <>
          <div className="stats-container">
            <div className="stat-card">
              <h2>Your Balance</h2>
              <p className="stat-value">{userBalance.toLocaleString()} STX</p>
              {loading && (
                <div className="stat-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>

            <div className="stat-card">
              <h2>Your Deposits</h2>
              <p className="stat-value">{userData?.deposited?.toLocaleString() || "0"} STX</p>
              {loading && (
                <div className="stat-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>

            <div className="stat-card">
              <h2>Total Protocol Liquidity</h2>
              <p className="stat-value">{totalLiquidity.toLocaleString()} STX</p>
              {loading && (
                <div className="stat-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>

            <div className="stat-card">
              <h2>Flash Loan Fee</h2>
              <p className="stat-value">{flashLoanFee}%</p>
              {loading && (
                <div className="stat-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              )}
            </div>
          </div>

          {lastUpdated && (
            <div className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
              <div className="auto-refresh-indicator">
                <div className="dot"></div>
                Auto-refreshing every 30 seconds
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard;