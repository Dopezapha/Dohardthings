"use client"

import { useState } from "react"
import useForm from "../hooks/useForm"
import useContractCall from "../hooks/useContractCall"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"

const FlashLoan = ({ account }) => {
  const [formValues, handleChange, resetForm] = useForm({
    amount: "",
    token: "STX",
    recipient: "",
  })
  const [success, setSuccess] = useState(null)

  // Create a contract object with the necessary properties
  const contract = account
    ? {
        contractAddress: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9", // Use the default or get from props
        contractName: "flash-lend", // Use the default contract name
      }
    : null

  // Set up contract call for flash loan with proper contract initialization
  const {
    execute: executeFlashLoan,
    loading,
    error,
  } = useContractCall(contract, {
    functionName: "flash-loan",
  })

  const handleFlashLoan = async (e) => {
    e.preventDefault()
    setSuccess(null)

    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      // Validate inputs
      if (!formValues.amount || formValues.amount <= 0) {
        throw new Error("Please enter a valid amount")
      }

      if (!formValues.recipient) {
        throw new Error("Please enter a recipient address")
      }

      // Execute the flash loan
      await executeFlashLoan(formValues.amount, formValues.token, formValues.recipient)

      setSuccess(`Flash loan of ${formValues.amount} ${formValues.token} executed successfully`)
      resetForm()
    } catch (err) {
      // Error is handled by useContractCall
      console.error("Flash loan error:", err)
    }
  }

  return (
    <div className="flash-loan">
      <h1>Flash Loan</h1>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <div className="card">
        <form onSubmit={handleFlashLoan}>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formValues.amount}
              onChange={handleChange}
              required
              min="0"
              step="any"
              placeholder="Enter loan amount"
            />
          </div>
          <div className="form-group">
            <label htmlFor="token">Token</label>
            <select id="token" name="token" value={formValues.token} onChange={handleChange} required>
              <option value="STX">STX</option>
              {/* Add more token options as needed */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="recipient">Recipient Contract</label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={formValues.recipient}
              onChange={handleChange}
              required
              placeholder="Enter recipient contract address"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !account}>
            {loading ? "Processing..." : "Execute Flash Loan"}
          </button>
        </form>
      </div>

      <div className="info-box">
        <h3>Flash Loan Information</h3>
        <p>
          Flash loans allow you to borrow assets without collateral, as long as the borrowed amount is returned within
          the same transaction.
        </p>
        <ul>
          <li>Current fee: 0.3% of borrowed amount</li>
          <li>Maximum loan: Limited by protocol liquidity</li>
          <li>The recipient must be a contract that implements the flash loan interface</li>
        </ul>
      </div>
    </div>
  )
}

export default FlashLoan