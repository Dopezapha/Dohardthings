import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage]);

  const fetchTransactions = async (page) => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch transactions
      // const response = await api.getTransactions(page);
      // setTransactions(response.transactions);
      // setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transactions');
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="transaction-history">
      <h2>Transaction History</h2>
      {transactions.map((tx) => (
        <div key={tx.id} className="transaction-item">
          <span className="transaction-type">{tx.type}</span>
          <span className="transaction-amount">{tx.amount} STX</span>
        </div>
      ))}
      <div className="pagination">
        {[...Array(totalPages).keys()].map((page) => (
          <button
            key={page + 1}
            onClick={() => setCurrentPage(page + 1)}
            className={currentPage === page + 1 ? 'active' : ''}
          >
            {page + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
