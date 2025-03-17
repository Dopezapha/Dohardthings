"use client"
import { Link } from "react-router-dom"
import { formatStacksAddress } from "../utils/stacks-auth"

const Header = ({ account, balance, openWalletModal, disconnectWallet, isLoading, isConnected }) => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">FlashLend Protocol</Link>
      </div>
      <div className="wallet-container">
        {isConnected && account ? (
          <div className="connected-wallet">
            <div className="account-info">
              <span className="account-address">{formatStacksAddress(account)}</span>
              <span className="account-balance">{balance.toFixed(4)} STX</span>
            </div>
            <button className="btn-disconnect" onClick={disconnectWallet}>
              Disconnect
            </button>
          </div>
        ) : (
          <button className="connect-wallet" onClick={openWalletModal} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-indicator"></span>
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </button>
        )}
      </div>
    </header>
  )
}

export default Header