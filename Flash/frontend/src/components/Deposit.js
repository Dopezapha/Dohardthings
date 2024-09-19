import React from 'react';
import Button from './Button';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import useForm from '../hooks/useForm';
import useContractCall from '../hooks/useContractCall';

const Deposit = () => {
  const [formValues, handleChange, resetForm] = useForm({ amount: '', token: '' });
  const { execute: deposit, loading, error, data: depositResult } = useContractCall(/* contractCall.deposit */);

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      await deposit(formValues.amount, formValues.token);
      resetForm();
    } catch (err) {
      // Error is handled by useContractCall
    }
  };

  return (
    <div className="deposit">
      <h2>Deposit</h2>
      {error && <ErrorMessage message={error} />}
      {depositResult && <SuccessMessage message={`Successfully deposited ${formValues.amount} ${formValues.token}`} />}
      <form onSubmit={handleDeposit}>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formValues.amount}
            onChange={handleChange}
            required
            min="0"
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="token">Token</label>
          <select
            id="token"
            name="token"
            value={formValues.token}
            onChange={handleChange}
            required
          >
            <option value="">Select a token</option>
            <option value="STX">STX</option>
            {/* Add more token options as needed */}
          </select>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </Button>
      </form>
    </div>
  );
};

export default Deposit;
