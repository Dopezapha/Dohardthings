"use client"

import { useState, useCallback } from "react"
import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode } from "@stacks/transactions"

// Define STACKS_TESTNET directly since we can't import it from constants
const STACKS_TESTNET = {
  url: "https://api.testnet.hiro.so",
  chainId: "0x80000000",
  networkId: "testnet",
}

const DEFAULT_CONTRACT_ADDRESS = "STX4HSE7ZANXM0R9HE06Z6ZCX5KCZK5XS7SAKTT0"
const DEFAULT_CONTRACT_NAME = "flash_loan"

/**
 * Hook for making contract calls to Stacks blockchain
 * @param {Object} contract - Contract object with address and name
 * @param {Object} options - Options for the contract call
 * @returns {Object} - Contract call execution functions and state
 */
export default function useContractCall(contract, options = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Extract contract details from the contract object or use defaults
  const contractAddress = contract?.contractAddress || DEFAULT_CONTRACT_ADDRESS
  const contractName = contract?.contractName || DEFAULT_CONTRACT_NAME

  // Extract options
  const {
    functionName = "",
    functionArgs = [],
    postConditions = [],
    postConditionMode = PostConditionMode.Deny,
    anchorMode = AnchorMode.Any,
    ...restOptions
  } = options

  const execute = useCallback(
    async (...args) => {
      // Get userSession from window object (assuming it's set in App.tsx)
      const userSession = window.userSession

      if (!userSession || !userSession.isUserSignedIn()) {
        throw new Error("User not signed in")
      }

      // Check if contract is null
      if (!contract) {
        const error = "Contract is not initialized"
        setError(error)
        throw new Error(error)
      }

      setLoading(true)
      setError(null)

      try {
        // Check if contract exists
        const contractCheckResponse = await fetch(
          `https://api.testnet.hiro.so/v2/contracts/interface/${contractAddress}/${contractName}`,
        )

        if (!contractCheckResponse.ok) {
          throw new Error(`Contract ${contractAddress}.${contractName} not found`)
        }

        // Prepare function arguments
        const callArgs = args.length > 0 ? args : functionArgs

        // Create the transaction
        const txOptions = {
          contractAddress,
          contractName,
          functionName,
          functionArgs: callArgs,
          senderKey: userSession.loadUserData().appPrivateKey,
          network: STACKS_TESTNET,
          postConditionMode,
          postConditions,
          anchorMode,
          ...restOptions,
        }

        const transaction = await makeContractCall(txOptions)

        // Broadcast the transaction
        const broadcastResponse = await broadcastTransaction(transaction, STACKS_TESTNET)

        if (broadcastResponse.error) {
          throw new Error(broadcastResponse.error)
        }

        return broadcastResponse
      } catch (err) {
        console.error("Contract call error:", err)
        setError(err.message || "Failed to execute contract call")
        throw err
      } finally {
        setLoading(false)
      }
    },
    [
      contract,
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      postConditions,
      postConditionMode,
      anchorMode,
    ],
  )

  return {
    execute,
    loading,
    error,
  }
}