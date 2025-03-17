"use client"

import { useState, useEffect } from "react"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"
import useForm from "../hooks/useForm"
import useContractCall from "../hooks/useContractCall"
import { getUserProtocolData } from "../utils/contract-calls"

const Withdraw = ({ account }) => {
  const [formValues, handleChange, resetForm] = useForm({ amount: "", token: "STX" })
  const [userDeposits, setUserDeposits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Set up contract call for withdraw
  const {
    execute: withdraw,
    loading: withdrawLoading,
    error: withdrawError,
  } = useContractCall(null, {
    functionName: "withdraw",
  })

  // Fetch user's deposited amount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!account) return

      setDataLoading(true)
      try {
        const userData = await getUserProtocolData(account)
        setUserDeposits(userData?.deposited || 0)
      } catch (err) {
        console.error("Error fetching user deposits:", err)
        // Set a default value for development
        setUserDeposits(500)
      } finally {
        setDataLoading(false)
      }
    }

    fetchUserData()
  }, [account])

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!account) {
        throw new Error("Please connect your wallet first")
      }

      const amount = Number.parseFloat(formValues.amount)

      // Validate withdrawal amount
      if (amount <= 0) {
        throw new Error("Amount must be greater than 0")
      }

      if (amount > userDeposits) {
        throw new Error(`Insufficient funds. You only have ${userDeposits} ${formValues.token} deposited.`)
      }

      // Execute the withdraw contract call
      await withdraw(amount)

      setSuccess(`Successfully withdrew ${amount} ${formValues.token}`)
      resetForm()

      // Update user deposits after withdrawal
      setUserDeposits((prev) => prev - amount)
    } catch (err) {
      setError("Failed to withdraw: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="withdraw">
      <h1>Withdraw</h1>

      {error && <ErrorMessage message={error} />}
      {withdrawError && <ErrorMessage message={withdrawError} />}
      {success && <SuccessMessage message={success} />}

      <div className="card">
        <div className="balance-info">
          <h3>Your Deposits</h3>
          <p className="balance">{dataLoading ? "Loading..." : `${userDeposits} STX`}</p>
        </div>

        <form onSubmit={handleWithdraw}>
          <div className="form-group">
            <label htmlFor="withdrawAmount">Amount</label>
            <input
              type="number"
              id="withdrawAmount"
              name="amount"
              value={formValues.amount}
              onChange={handleChange}
              required
              min="0"
              max={userDeposits}
              step="any"
              placeholder="Enter amount to withdraw"
            />
          </div>
          <div className="form-group">
            <label htmlFor="withdrawToken">Token</label>
            <select id="withdrawToken" name="token" value={formValues.token} onChange={handleChange} required>
              <option value="STX">STX</option>
              {/* Add more token options as needed */}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || withdrawLoading || !account}>
            {loading || withdrawLoading ? "Processing..." : "Withdraw"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Withdraw;