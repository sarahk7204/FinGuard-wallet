import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency } from "../../utils/formatCurrency";

const Wallets = () => {
  const { token } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getWallets(token);
        setWallets(res.data.wallets || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load wallets.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) return <Loader />;
  if (error)   return <div className="error-message">{error}</div>;

  return (
    <div>
      <div className="page-header"><h1>Wallet Management</h1></div>

      {wallets.length === 0 ? (
        <EmptyState icon="💼" message="No wallets found." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Deposits</th>
                <th>Withdrawals</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => (
                <tr key={w._id}>
                  <td>{w.userId?.name || "—"}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{w.userId?.email || "—"}</td>
                  <td><strong>{formatCurrency(w.balance)}</strong></td>
                  <td style={{ color: "var(--success)" }}>{formatCurrency(w.totalDeposits)}</td>
                  <td style={{ color: "var(--danger)" }}>{formatCurrency(w.totalWithdrawals)}</td>
                  <td><span className={`status-badge status-${w.status}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Wallets;
