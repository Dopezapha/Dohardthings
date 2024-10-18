import React, { useEffect, useState } from 'react';

export const TransactionStatus = ({ txId, network }) => {
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${network.coreApiUrl}/extended/v1/tx/${txId}`);
        const data = await response.json();
        setStatus(data.tx_status);
      } catch (error) {
        console.error('Error checking transaction status:', error);
      }
    };

    const intervalId = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [txId, network]);

  return (
    <div className="transaction-status">
      <h3>Transaction Status</h3>
      <p>Transaction ID: {txId}</p>
      <p>Status: {status}</p>
    </div>
  );
};
