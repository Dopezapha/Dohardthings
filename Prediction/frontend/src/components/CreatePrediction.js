import React, { useState } from 'react';
import { contractPrincipal } from '../constants';
import { callReadOnlyFunction, makeSTXTokenTransfer } from '@stacks/transactions';

export const CreatePrediction = ({ userSession, network }) => {
  const [query, setQuery] = useState('');
  const [details, setDetails] = useState('');
  const [closingBlock, setClosingBlock] = useState('');
  const [choices, setChoices] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const functionArgs = [
        query,
        details,
        closingBlock,
        choices.filter(choice => choice.trim() !== '')
      ];

      const options = {
        contractAddress: contractPrincipal.split('.')[0],
        contractName: contractPrincipal.split('.')[1],
        functionName: 'create-prediction-market',
        functionArgs,
        network,
        senderAddress: userSession.loadUserData().profile.stxAddress.mainnet,
      };

      const transaction = await makeSTXTokenTransfer(options);
      // Handle the transaction result
      console.log('Transaction:', transaction);
    } catch (err) {
      console.error('Error creating prediction:', err);
      setError('Failed to create prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addChoice = () => {
    if (choices.length < 20) {
      setChoices([...choices, '']);
    }
  };

  return (
    <div className="create-prediction">
      <h2>Create Prediction Market</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <textarea
          placeholder="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Closing Block"
          value={closingBlock}
          onChange={(e) => setClosingBlock(e.target.value)}
          required
        />
        {choices.map((choice, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Choice ${index + 1}`}
            value={choice}
            onChange={(e) => {
              const newChoices = [...choices];
              newChoices[index] = e.target.value;
              setChoices(newChoices);
            }}
            required
          />
        ))}
        <button type="button" onClick={addChoice} className="button secondary">Add Choice</button>
        <button type="submit" className="button primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Prediction Market'}
        </button>
      </form>
    </div>
  );
};
