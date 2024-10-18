import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FlashLoan from './components/FlashLoan';
import Deposit from './components/Deposit';
import Withdraw from './components/Withdraw';
import Governance from './components/Governance';
import AdminPanel from './components/AdminPanel';
import './App.css';

const App = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // TODO: Connect to the Stacks wallet and fetch account details
  }, []);

  return (
    <Router>
      <div className="app">
        <Header account={account} balance={balance} />
        <div className="main-container">
          <Sidebar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flash-loan" element={<FlashLoan />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/withdraw" element={<Withdraw />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
