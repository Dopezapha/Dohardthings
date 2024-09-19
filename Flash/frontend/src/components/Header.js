import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ account, balance }) => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Flash Loan DApp</Link>
      </div>
      <div className="account-info">
        {account ? (
          <>
            <span className="account-address">{account.substring(0, 6)}...{account.substring(account.length - 4)}</span>
            <span className="account-balance">{balance} STX</span>
          </>
        ) : (
          <button className="connect-wallet">Connect Wallet</button>
        )}
      </div>
    </header>
  );
};

export default Header;
