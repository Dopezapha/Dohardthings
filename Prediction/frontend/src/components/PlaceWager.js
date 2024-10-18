import React, { useState } from 'react';
import { contractPrincipal } from '../constants';
import { makeSTXTokenTransfer } from '@stacks/transactions';

export const PlaceWager = ({ userSession, network }) => {
  const [predictionId, setPredictionId] = useState('');
  const [choiceIndex, setChoiceIndex] = useState('');
  const [wagerAmount, setWagerAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [
        predictionId,
        choiceIndex,
        wagerAmount
      ];

      const options = {
        contractAddress: contractPrincipal.split('.')[0],
        contractName: contractPrincipal.split('.')[1],
        functionName: 'place-wager',
        functionArgs,
        network,
        senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
      };

      const transaction = await makeSTXTokenTransfer(options);
      // Handle the transaction result
      console.log('Transaction:', transaction);
    } catch (err) {
      console.error('Error placing wager:', err);
      setError('Failed to place wager. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="place-wager">
      <h2>Place Wager</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Prediction ID"
          value={predictionId}
          onChange={(e) => setPredictionId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Choice Index"
          value={choiceIndex}
          onChange={(e) => setChoiceIndex(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Wager Amount (in STX)"
          value={wagerAmount}
          onChange={(e) => setWagerAmount(e.target.value)}
          required
        />
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Placing Wager...' : 'Place Wager'}
        </button>
      </form>
    </div>
  );
};