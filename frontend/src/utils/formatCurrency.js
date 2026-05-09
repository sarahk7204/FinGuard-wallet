export const formatCurrency = (amount, showLabel = true) => {
  if (amount === null || amount === undefined) return showLabel ? "PKR 0" : "0";
  const formatted = Number(amount).toLocaleString("en-PK");
  return showLabel ? `PKR ${formatted}` : formatted;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
};
