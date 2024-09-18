import React, { useState, useEffect } from 'react';
import { Connect } from './Connect';
import { CreatePrediction } from './CreatePrediction';
import { PredictionList } from './PredictionList';
import { PlaceWager } from './PlaceWager';
import { ClaimPayout } from './ClaimPayout';
import { TransactionStatus } from './TransactionStatus';
import { ErrorBoundary } from './ErrorBoundary';
import { useConnect } from '@stacks/connect-react';
import { StacksMainnet } from '@stacks/network';
import { AppConfig, UserSession } from '@stacks/auth';
import { callReadOnlyContractFunction } from './utils';
import './styles.css';

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export const App = () => {
  const { authenticated } = useConnect();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastTransaction, setLastTransaction] = useState(null);

  const network = new StacksMainnet();

  useEffect(() => {
    if (authenticated) {
      fetchPredictions();
    }
  }, [authenticated]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await callReadOnlyContractFunction('get-all-predictions', [], userSession);
      setPredictions(result.value);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to fetch predictions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = (txId) => {
    setLastTransaction(txId);
  };

  return (
    <div className="app">
      <ErrorBoundary>
        <header className="app-header">
          <h1>Prediction Market</h1>
          <Connect userSession={userSession} />
        </header>
        <main className="app-main">
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            authenticated && (
              <>
                <CreatePrediction userSession={userSession} network={network} onTransaction={handleTransaction} />
                <PredictionList predictions={predictions} />
                <PlaceWager userSession={userSession} network={network} onTransaction={handleTransaction} />
                <ClaimPayout userSession={userSession} network={network} onTransaction={handleTransaction} />
                {lastTransaction && <TransactionStatus txId={lastTransaction} network={network} />}
              </>
            )
          )}
        </main>
      </ErrorBoundary>
    </div>
  );
};
