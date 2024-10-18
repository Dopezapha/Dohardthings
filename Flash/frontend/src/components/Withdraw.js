import React, { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement withdraw logic
      // const result = await contractCall.withdraw(amount, token);
      setSuccess(`Successfully withdrew ${amount} ${token}`);
      setAmount('');
      setToken('');
    } catch (err) {
      setError('Failed to withdraw: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw">
      <h2>Withdraw</h2>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      <form onSubmit={handleWithdraw}>
        <div className="form-group">
          <label htmlFor="withdrawAmount">Amount</label>
          <input
            type="number"
            id="withdrawAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="withdrawToken">Token</label>
          <select
            id="withdrawToken"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          >
            <option value="">Select a token</option>
            <option value="STX">STX</option>
            {/* Add more token options as needed */}
          </select>
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  );
};

export default Withdraw;