"use client"

import { useState, useEffect } from "react"
import useForm from "../hooks/useForm"
import useContractCall from "../hooks/useContractCall"
import ErrorMessage from "./ErrorMessage"
import SuccessMessage from "./SuccessMessage"

const Governance = ({ account }) => {
  const [proposals, setProposals] = useState([])
  const [formValues, handleChange, resetForm] = useForm({ description: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Set up contract calls for governance
  const {
    execute: createProposal,
    loading: createLoading,
    error: createError,
  } = useContractCall(null, {
    functionName: "create-proposal",
  })

  const {
    execute: voteOnProposal,
    loading: voteLoading,
    error: voteError,
  } = useContractCall(null, {
    functionName: "vote-on-proposal",
  })

  // Fetch proposals on component mount
  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would call the contract
      // For now, use mock data
      const mockProposals = [
        { id: 1, description: "Increase flash loan fee to 0.5%", votesFor: 120, votesAgainst: 30, status: "active" },
        { id: 2, description: "Add support for new token pairs", votesFor: 200, votesAgainst: 15, status: "active" },
        {
          id: 3,
          description: "Reduce protocol fees for high volume users",
          votesFor: 85,
          votesAgainst: 95,
          status: "active",
        },
      ]

      setProposals(mockProposals)
    } catch (err) {
      console.error("Error fetching proposals:", err)
      setError("Failed to fetch proposals: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProposal = async (e) => {
    e.preventDefault()
    setSuccess(null)

    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      if (!formValues.description.trim()) {
        throw new Error("Please enter a proposal description")
      }

      // Execute the create proposal contract call
      await createProposal(formValues.description)

      // Add the new proposal to the list (in a real app, we would refetch)
      const newProposal = {
        id: proposals.length + 1,
        description: formValues.description,
        votesFor: 0,
        votesAgainst: 0,
        status: "active",
      }

      setProposals([...proposals, newProposal])
      setSuccess("Proposal created successfully")
      resetForm()
    } catch (err) {
      console.error("Error creating proposal:", err)
    }
  }

  const handleVote = async (proposalId, voteFor) => {
    if (!account) {
      alert("Please connect your wallet first")
      return
    }

    try {
      // Execute the vote contract call
      await voteOnProposal(proposalId, voteFor)

      // Update the proposal in the UI (in a real app, we would refetch)
      const updatedProposals = proposals.map((proposal) => {
        if (proposal.id === proposalId) {
          if (voteFor) {
            return { ...proposal, votesFor: proposal.votesFor + 1 }
          } else {
            return { ...proposal, votesAgainst: proposal.votesAgainst + 1 }
          }
        }
        return proposal
      })

      setProposals(updatedProposals)
      setSuccess(`Vote recorded for proposal #${proposalId}`)
    } catch (err) {
      console.error("Error voting on proposal:", err)
    }
  }

  return (
    <div className="governance">
      <h1>Governance</h1>

      {error && <ErrorMessage message={error} />}
      {createError && <ErrorMessage message={createError} />}
      {voteError && <ErrorMessage message={voteError} />}
      {success && <SuccessMessage message={success} />}

      <div className="card">
        <h2>Create Proposal</h2>
        <form onSubmit={handleCreateProposal}>
          <div className="form-group">
            <label htmlFor="description">Proposal Description</label>
            <textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              required
              placeholder="Describe your proposal"
              rows={4}
            ></textarea>
          </div>
          <button type="submit" className="btn-primary" disabled={createLoading || !account}>
            {createLoading ? "Creating..." : "Create Proposal"}
          </button>
        </form>
      </div>

      <div className="proposals-list">
        <h2>Active Proposals</h2>

        {loading ? (
          <div className="loading">
            <div className="loading-spinner-small"></div>
            <span>Loading proposals...</span>
          </div>
        ) : proposals.length === 0 ? (
          <p className="empty-state">No active proposals</p>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <h3>Proposal #{proposal.id}</h3>
              <p>{proposal.description}</p>

              <div className="proposal-stats">
                <div className="stat">
                  <span className="label">For:</span>
                  <span className="value">{proposal.votesFor}</span>
                </div>
                <div className="stat">
                  <span className="label">Against:</span>
                  <span className="value">{proposal.votesAgainst}</span>
                </div>
                <div className="stat">
                  <span className="label">Status:</span>
                  <span className="value status">{proposal.status}</span>
                </div>
              </div>

              <div className="vote-buttons">
                <button
                  onClick={() => handleVote(proposal.id, true)}
                  className="btn-success"
                  disabled={voteLoading || !account}
                >
                  Vote For
                </button>
                <button
                  onClick={() => handleVote(proposal.id, false)}
                  className="btn-danger"
                  disabled={voteLoading || !account}
                >
                  Vote Against
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Governance;