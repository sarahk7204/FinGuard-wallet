import { useState, useEffect } from "react";
import {
  fetchWallet,
  depositFunds,
  withdrawFunds,
  transferFunds,
} from "../../services/walletService";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  // Modal state
  const [modal, setModal] = useState(null); // "deposit" | "withdraw" | "transfer" | null
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadWallet = async () => {
    try {
      const res = await fetchWallet();
      setWallet(res.data.data.wallet);
    } catch (err) {
      setError("Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWallet(); }, []);

  const clearForm = () => {
    setAmount("");
    setDescription("");
    setReceiverEmail("");
    setModal(null);
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return showMessage("Enter a valid amount", "error");
    setActionLoading(true);
    try {
      await depositFunds(Number(amount), description);
      showMessage("Deposit successful!", "success");
      clearForm();
      loadWallet();
    } catch (err) {
      showMessage(err.response?.data?.message || "Deposit failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return showMessage("Enter a valid amount", "error");
    setActionLoading(true);
    try {
      await withdrawFunds(Number(amount), description);
      showMessage("Withdrawal successful!", "success");
      clearForm();
      loadWallet();
    } catch (err) {
      showMessage(err.response?.data?.message || "Withdrawal failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return showMessage("Enter a valid amount", "error");
    if (!receiverEmail) return showMessage("Receiver email is required", "error");
    setActionLoading(true);
    try {
      await transferFunds(receiverEmail, Number(amount), description);
      showMessage("Transfer successful!", "success");
      clearForm();
      loadWallet();
    } catch (err) {
      showMessage(err.response?.data?.message || "Transfer failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading wallet...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="wallet-page">
      <h1>My Wallet</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Balance Card */}
      <div className="wallet-card">
        <p className="wallet-label">Available Balance</p>
        <h2 className="wallet-balance">PKR {wallet?.balance?.toLocaleString()}</h2>
        {wallet?.balance < 500 && (
          <div className="low-balance-alert">⚠️ Low balance — consider depositing funds.</div>
        )}
        <span className={`wallet-status status-${wallet?.status}`}>{wallet?.status}</span>
      </div>

      {/* Action Buttons */}
      <div className="wallet-actions">
        <button className="btn-primary" onClick={() => setModal("deposit")}>Deposit</button>
        <button className="btn-secondary" onClick={() => setModal("withdraw")}>Withdraw</button>
        <button className="btn-secondary" onClick={() => setModal("transfer")}>Transfer</button>
      </div>

      {/* Stats */}
      <div className="wallet-stats">
        <div className="stat"><p>Total Deposited</p><strong>PKR {wallet?.totalDeposits?.toLocaleString()}</strong></div>
        <div className="stat"><p>Total Withdrawn</p><strong>PKR {wallet?.totalWithdrawals?.toLocaleString()}</strong></div>
        <div className="stat"><p>Transfers In</p><strong>PKR {wallet?.totalTransfersIn?.toLocaleString()}</strong></div>
        <div className="stat"><p>Transfers Out</p><strong>PKR {wallet?.totalTransfersOut?.toLocaleString()}</strong></div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="modal-overlay" onClick={() => !actionLoading && clearForm()}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>
              {modal === "deposit" ? "Deposit Funds" :
               modal === "withdraw" ? "Withdraw Funds" : "Transfer Funds"}
            </h2>

            <form onSubmit={modal === "deposit" ? handleDeposit : modal === "withdraw" ? handleWithdraw : handleTransfer}>
              {modal === "transfer" && (
                <div className="form-group">
                  <label>Receiver Email</label>
                  <input
                    type="email"
                    placeholder="Enter receiver's email"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    disabled={actionLoading}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Amount (PKR)</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  min="1"
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <input
                  type="text"
                  placeholder="Add a note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={actionLoading}
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
                <button type="button" className="btn-secondary" onClick={clearForm} disabled={actionLoading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
