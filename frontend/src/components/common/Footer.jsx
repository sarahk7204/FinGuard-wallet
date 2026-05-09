const Footer = () => (
  <footer style={{
    textAlign: "center",
    padding: "16px",
    fontSize: 13,
    color: "var(--text-secondary)",
    borderTop: "1px solid var(--border)",
    marginTop: "auto",
  }}>
    FinGuard &copy; {new Date().getFullYear()} — FAST University Islamabad | 6th Semester
  </footer>
);

export default Footer;
