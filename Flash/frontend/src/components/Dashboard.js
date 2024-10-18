import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import TransactionHistory from './TransactionHistory';

const Dashboard = () => {
  const [totalLiquidity, setTotalLiquidity] = useState(0);
  const [flashLoanFee, setFlashLoanFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to fetch dashboard data
      // const response = await api.getDashboardData();
      // setTotalLiquidity(response.totalLiquidity);
      // setFlashLoanFee(response.flashLoanFee);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-container">
        <div className="stat-card">
          <h2>Total Liquidity</h2>
          <p className="stat-value">{totalLiquidity} STX</p>
        </div>
        <div className="stat-card">
          <h2>Flash Loan Fee</h2>
          <p className="stat-value">{flashLoanFee}%</p>
        </div>
      </div>
      <TransactionHistory />
    </div>
  );
};

export default Dashboard;
