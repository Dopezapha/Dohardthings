import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><NavLink to="/" end className={({isActive}) => isActive ? "active" : ""}>Dashboard</NavLink></li>
        <li><NavLink to="/flash-loan" className={({isActive}) => isActive ? "active" : ""}>Flash Loan</NavLink></li>
        <li><NavLink to="/deposit" className={({isActive}) => isActive ? "active" : ""}>Deposit</NavLink></li>
        <li><NavLink to="/withdraw" className={({isActive}) => isActive ? "active" : ""}>Withdraw</NavLink></li>
        <li><NavLink to="/governance" className={({isActive}) => isActive ? "active" : ""}>Governance</NavLink></li>
        <li><NavLink to="/admin" className={({isActive}) => isActive ? "active" : ""}>Admin Panel</NavLink></li>
      </ul>
    </nav>
  );
};

export default Sidebar;
