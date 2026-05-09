import { useState, useEffect } from "react";
import adminService from "../../services/adminService";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";
import { formatCurrency } from "../../utils/formatCurrency";
import { MONTHS } from "../../utils/constants";

const AdminReports = () => {
  const { token } = useAuth();
  const [volume, setVolume]     = useState([]);
  const [balance, setBalance]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [vRes, bRes] = await Promise.all([
          adminService.getTransactionVolume(token),
          adminService.getSystemBalance(token),
        ]);
        setVolume(vRes.data.volume || []);
        setBalance(bRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load reports.");
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
      <div className="page-header"><h1>System Reports</h1></div>

      {/* System Balance Summary */}
      <div className="section" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>System Balance Summary</h2>
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="label">Total Balance in System</div>
            <div className="value success" style={{ fontSize: 20 }}>
              {formatCurrency(balance?.totalBalance)}
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="label">Total Wallets</div>
            <div className="value">{balance?.walletCount ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Transaction Volume */}
      <div className="section">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Transaction Volume (Monthly)</h2>
        {volume.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No transaction data available.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Month</th><th>Year</th><th>Type</th><th>Total Amount</th><th>Count</th></tr>
              </thead>
              <tbody>
                {volume.map((v, i) => (
                  <tr key={i}>
                    <td>{MONTHS[(v._id?.month ?? 1) - 1]}</td>
                    <td>{v._id?.year}</td>
                    <td><span className={`txn-type txn-${v._id?.type}`}>{v._id?.type}</span></td>
                    <td><strong>{formatCurrency(v.totalAmount)}</strong></td>
                    <td style={{ color: "var(--text-secondary)" }}>{v.count} txns</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
