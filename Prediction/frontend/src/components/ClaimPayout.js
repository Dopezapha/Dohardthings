import React, { useState } from 'react';
import { contractPrincipal } from '../constants';
import { makeSTXTokenTransfer } from '@stacks/transactions';

export const ClaimPayout = ({ userSession, network }) => {
  const [predictionId, setPredictionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [predictionId];

      const options = {
        contractAddress: contractPrincipal.split('.')[0],
        contractName: contractPrincipal.split('.')[1],
        functionName: 'claim-payout-or-refund',
        functionArgs,
        network,
        senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
      };

      const transaction = await makeSTXTokenTransfer(options);
      // Handle the transaction result
      console.log('Transaction:', transaction);
    } catch (err) {
      console.error('Error claiming payout:', err);
      setError('Failed to claim payout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claim-payout">
      <h2>Claim Payout</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Prediction ID"
          value={predictionId}
          onChange={(e) => setPredictionId(e.target.value)}
          required
        />
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Claiming Payout...' : 'Claim Payout'}
        </button>
      </form>
    </div>
  );
};
