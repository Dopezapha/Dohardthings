import React from 'react';
import { useConnect } from '@stacks/connect-react';

export const Connect = ({ userSession }) => {
  const { handleOpenAuth } = useConnect();

  const handleConnect = () => {
    handleOpenAuth();
  };

  const handleSignOut = () => {
    userSession.signUserOut();
  };

  if (userSession.isUserSignedIn()) {
    return (
      <div className="connect">
        <button onClick={handleSignOut} className="button secondary">Sign Out</button>
      </div>
    );
  }

  return (
    <div className="connect">
      <button onClick={handleConnect} className="button primary">Connect Wallet</button>
    </div>
  );
};
