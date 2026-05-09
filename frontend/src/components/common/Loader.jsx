const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="loading">
      <div className="loader-spinner" />
      <p>{text}</p>
      <style>{`
        .loader-spinner {
          width: 36px; height: 36px;
          border: 3px solid #334155;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Loader;
