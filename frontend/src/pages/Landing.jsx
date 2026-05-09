import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo">FinGuard</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Manage Your Money Smarter</h1>
        <p>
          FinGuard is a secure digital wallet platform for deposits,
          withdrawals, transfers, expense tracking, and budget management.
        </p>
        <div className="hero-buttons">
          <Link to="/register" className="btn-primary">Create Account</Link>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Secure Wallet</h3>
          <p>Deposit, withdraw, and transfer funds with full backend validation.</p>
        </div>
        <div className="feature-card">
          <h3>Expense Tracking</h3>
          <p>Record and categorize your expenses to understand your spending.</p>
        </div>
        <div className="feature-card">
          <h3>Budget Alerts</h3>
          <p>Set monthly budgets and get notified before you overspend.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>FinGuard &copy; 2024 — FAST University Islamabad | 6th Semester FinTech Project</p>
      </footer>
    </div>
  );
};

export default Landing;