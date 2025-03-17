"use client"

import { useState } from "react"
import useForm from "../hooks/useForm"
import useContractCall from "../hooks/useContractCall"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"

const AdminPanel = ({ account }) => {
  const [limitForm, handleLimitChange, resetLimitForm] = useForm({
    userAddress: "",
    borrowingLimit: "",
  })

  const [tokenForm, handleTokenChange, resetTokenForm] = useForm({
    tokenAddress: "",
    tokenName: "",
    tokenSymbol: "",
  })

  const [success, setSuccess] = useState(null)

  // Set up contract calls for admin functions
  const {
    execute: setBorrowingLimit,
    loading: limitLoading,
    error: limitError,
  } = useContractCall(null, {
    functionName: "set-borrowing-limit",
  })

  const {
    execute: addToken,
    loading: tokenLoading,
    error: tokenError,
  } = useContractCall(null, {
    functionName: "add-supported-token",
  })

  const handleSetBorrowingLimit = async (e) => {
    e.preventDefault()
    setSuccess(null)

    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      // Validate inputs
      if (!limitForm.userAddress) {
        throw new Error("Please enter a user address")
      }

      if (!limitForm.borrowingLimit || limitForm.borrowingLimit < 0) {
        throw new Error("Please enter a valid borrowing limit")
      }

      // Execute the set borrowing limit contract call
      await setBorrowingLimit(limitForm.userAddress, limitForm.borrowingLimit)

      setSuccess(`Borrowing limit set to ${limitForm.borrowingLimit} for ${limitForm.userAddress}`)
      resetLimitForm()
    } catch (err) {
      console.error("Error setting borrowing limit:", err)
    }
  }

  const handleAddToken = async (e) => {
    e.preventDefault()
    setSuccess(null)

    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      // Validate inputs
      if (!tokenForm.tokenAddress) {
        throw new Error("Please enter a token address")
      }

      if (!tokenForm.tokenName) {
        throw new Error("Please enter a token name")
      }

      if (!tokenForm.tokenSymbol) {
        throw new Error("Please enter a token symbol")
      }

      // Execute the add token contract call
      await addToken(tokenForm.tokenAddress, tokenForm.tokenName, tokenForm.tokenSymbol)

      setSuccess(`Token ${tokenForm.tokenSymbol} (${tokenForm.tokenName}) added successfully`)
      resetTokenForm()
    } catch (err) {
      console.error("Error adding token:", err)
    }
  }

  // Check if user is admin (in a real app, this would check the contract)
  const isAdmin = true // For development, assume the user is an admin

  if (!isAdmin) {
    return (
      <div className="admin-panel">
        <h1>Admin Panel</h1>
        <div className="error-message">
          <p>You do not have admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {limitError && <ErrorMessage message={limitError} />}
      {tokenError && <ErrorMessage message={tokenError} />}
      {success && <SuccessMessage message={success} />}

      <div className="card">
        <h2>Set Borrowing Limit</h2>
        <form onSubmit={handleSetBorrowingLimit}>
          <div className="form-group">
            <label htmlFor="userAddress">User Address</label>
            <input
              type="text"
              id="userAddress"
              name="userAddress"
              value={limitForm.userAddress}
              onChange={handleLimitChange}
              required
              placeholder="Enter Stacks address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="borrowingLimit">Borrowing Limit (STX)</label>
            <input
              type="number"
              id="borrowingLimit"
              name="borrowingLimit"
              value={limitForm.borrowingLimit}
              onChange={handleLimitChange}
              required
              min="0"
              step="any"
              placeholder="Enter borrowing limit"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={limitLoading || !account}>
            {limitLoading ? "Processing..." : "Set Limit"}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Add Supported Token</h2>
        <form onSubmit={handleAddToken}>
          <div className="form-group">
            <label htmlFor="tokenAddress">Token Contract Address</label>
            <input
              type="text"
              id="tokenAddress"
              name="tokenAddress"
              value={tokenForm.tokenAddress}
              onChange={handleTokenChange}
              required
              placeholder="Enter token contract address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tokenName">Token Name</label>
            <input
              type="text"
              id="tokenName"
              name="tokenName"
              value={tokenForm.tokenName}
              onChange={handleTokenChange}
              required
              placeholder="e.g., Stacks Token"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tokenSymbol">Token Symbol</label>
            <input
              type="text"
              id="tokenSymbol"
              name="tokenSymbol"
              value={tokenForm.tokenSymbol}
              onChange={handleTokenChange}
              required
              placeholder="e.g., STX"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={tokenLoading || !account}>
            {tokenLoading ? "Processing..." : "Add Token"}
          </button>
        </form>
      </div>

      <div className="info-box">
        <h3>Admin Functions</h3>
        <p>
          These functions are restricted to protocol administrators only. Use with caution as they affect the core
          protocol functionality.
        </p>
        <ul>
          <li>Setting borrowing limits affects how much a user can borrow</li>
          <li>Adding new tokens requires proper token contract integration</li>
          <li>All admin actions are recorded on the blockchain</li>
        </ul>
      </div>
    </div>
  )
}

export default AdminPanel;