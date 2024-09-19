import React, { useState } from 'react';

const AdminPanel = () => {
  const [borrowingLimit, setBorrowingLimit] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [newToken, setNewToken] = useState('');

  const handleSetBorrowingLimit = (e) => {
    e.preventDefault();
    // TODO: Implement set borrowing limit logic
  };

  const handleAddSupportedToken = (e) => {
    e.preventDefault();
    // TODO: Implement add supported token logic
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <form onSubmit={handleSetBorrowingLimit}>
        <h2>Set Borrowing Limit</h2>
        <div className="form-group">
          <label htmlFor="userAddress">User Address</label>
          <input
            type="text"
            id="userAddress"
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="borrowingLimit">Borrowing Limit</label>
          <input
            type="number"
            id="borrowingLimit"
            value={borrowingLimit}
            onChange={(e) => setBorrowingLimit(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Set Limit</button>
      </form>
      <form onSubmit={handleAddSupportedToken}>
        <h2>Add Supported Token</h2>
        <div className="form-group">
          <label htmlFor="newToken">Token Address</label>
          <input
            type="text"
            id="newToken"
            value={newToken}
            onChange={(e) => setNewToken(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Add Token</button>
      </form>
    </div>
  );
};

export default AdminPanel;
