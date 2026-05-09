export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidAmount = (amount) =>
  !isNaN(amount) && Number(amount) > 0;

export const isStrongPassword = (password) =>
  password && password.length >= 6;

export const isEmpty = (value) =>
  value === null || value === undefined || String(value).trim() === "";
