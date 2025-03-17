import React from 'react';

const TransactionHistory = ({ transactions = [] }) => {
  if (transactions.length === 0) {
    return (
      <div className="transaction-history">
        <div className="empty-state">
          <p>No transactions found for this wallet.</p>
        </div>
      </div>
    );
  }

  // Format timestamp to a readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format transaction type to be more readable
  const formatType = (type) => {
    switch (type) {
      case 'token_transfer':
        return 'Token Transfer';
      case 'contract_call':
        return 'Contract Call';
      case 'smart_contract':
        return 'Smart Contract';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="transaction-history">
      {transactions.map((tx) => (
        <div key={tx.id} className="transaction-item">
          <div className="transaction-details">
            <div className="transaction-type">{formatType(tx.type)}</div>
            <div className="transaction-date">{formatDate(tx.timestamp)}</div>
            <div className="transaction-status" data-status={tx.status.toLowerCase()}>
              {tx.status}
            </div>
          </div>
          {tx.amount > 0 && (
            <div className="transaction-amount">
              {tx.amount.toLocaleString()} STX
            </div>
          )}
        </div>
      ))}
      
      <div className="transaction-footer">
        <a 
          href={`https://explorer.stacks.co/address/${transactions[0]?.sender}?chain=testnet`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="view-all-link"
        >
          View all transactions in Explorer
        </a>
      </div>
    </div>
  );
};

export default TransactionHistory;