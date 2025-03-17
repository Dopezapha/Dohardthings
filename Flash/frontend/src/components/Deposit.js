"use client"

import { useState } from "react"
import Button from "./Button"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"
import useForm from "../hooks/useForm"
import useContractCall from "../hooks/useContractCall"
import { FungibleConditionCode, createStandardPrincipal } from "@stacks/transactions"

// Create a custom function to handle the missing export
function makeStandardSTXPostCondition(address, conditionCode, amount) {
  // Using the available exports to create a post condition for STX tokens
  return {
    type: 0x00, // PostConditionType.STX
    principal: createStandardPrincipal(address),
    conditionCode,
    amount: amount.toString(), // Use string representation instead of BigInt
  }
}

const Deposit = ({ account }) => {
  const [formValues, handleChange, resetForm] = useForm({ amount: "", token: "STX" })
  const [successMessage, setSuccessMessage] = useState(null)

  // Set up contract call for deposit
  const {
    execute: deposit,
    loading,
    error,
  } = useContractCall({
    contractAddress: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9",
    contractName: "flash-lend",
    functionName: "deposit",
    postConditions: formValues.amount
      ? [
          makeStandardSTXPostCondition(
            account,
            FungibleConditionCode.LessEqual,
            // Convert to micro STX (1 STX = 1,000,000 micro STX)
            Math.floor(Number.parseFloat(formValues.amount) * 1000000),
          ),
        ]
      : [],
  })

  const handleDeposit = async (e) => {
    e.preventDefault()
    setSuccessMessage(null)

    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    if (!formValues.amount || Number.parseFloat(formValues.amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      // Convert amount to micro STX for the contract call
      const microStxAmount = Math.floor(Number.parseFloat(formValues.amount) * 1000000)
      await deposit(microStxAmount)
      setSuccessMessage(`Successfully deposited ${formValues.amount} ${formValues.token}`)
      resetForm()
    } catch (err) {
      // Error is handled by useContractCall
      console.error("Deposit error:", err)
    }
  }

  return (
    <div className="deposit">
      <h1>Deposit</h1>

      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      <div className="card">
        <form onSubmit={handleDeposit}>
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
              placeholder="Enter amount to deposit"
            />
          </div>
          <div className="form-group">
            <label htmlFor="token">Token</label>
            <select id="token" name="token" value={formValues.token} onChange={handleChange} required>
              <option value="STX">STX</option>
              {/* Add more token options as needed */}
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Deposit"}
          </Button>
        </form>
      </div>

      <div className="info-box">
        <h3>Deposit Information</h3>
        <p>
          Deposit STX tokens to provide liquidity to the FlashLend protocol. You'll earn interest on your deposits based
          on protocol usage.
        </p>
        <ul>
          <li>Minimum deposit: 1 STX</li>
          <li>No lock-up period - withdraw anytime</li>
          <li>Interest is calculated and distributed daily</li>
        </ul>
      </div>
    </div>
  )
}

export default Deposit