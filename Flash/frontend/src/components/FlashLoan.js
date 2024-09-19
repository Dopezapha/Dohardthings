import React, { useState } from 'react';

const FlashLoan = () => {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleFlashLoan = (e) => {
    e.preventDefault();
    // TODO: Implement flash loan logic
  };

  return (
    <div className="flash-loan">
      <h1>Flash Loan</h1>
      <form onSubmit={handleFlashLoan}>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="token">Token</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="recipient">Recipient</label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Execute Flash Loan</button>
      </form>
    </div>
  );
};

export default FlashLoan;
