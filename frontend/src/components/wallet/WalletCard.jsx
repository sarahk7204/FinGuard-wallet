import { formatCurrency } from "../../utils/formatCurrency";

const WalletCard = ({ wallet, onDeposit, onWithdraw, onTransfer }) => {
  if (!wallet) return null;
  return (
    <div className="wallet-card">
      <p className="wallet-label">Available Balance</p>
      <h2 className="wallet-balance">{formatCurrency(wallet.balance)}</h2>
      {wallet.balance < 500 && (
        <div className="low-balance-alert">⚠️ Low balance — consider depositing.</div>
      )}
      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        <button onClick={onDeposit}  className="btn-primary"   style={{ flex: 1, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>Deposit</button>
        <button onClick={onWithdraw} className="btn-secondary" style={{ flex: 1, background: "rgba(255,255,255,0.1)" }}>Withdraw</button>
        <button onClick={onTransfer} className="btn-secondary" style={{ flex: 1, background: "rgba(255,255,255,0.1)" }}>Transfer</button>
      </div>
    </div>
  );
};

export default WalletCard;
