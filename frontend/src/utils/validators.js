export const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone = "") => /^[0-9+\-\s()]{7,15}$/.test(phone);

export const isStrongPassword = (password = "") => password.length >= 8;

export function validateLoginForm({ email, password }) {
  const errors = {};
  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateRegisterForm({ name, email, phone, password, confirmPassword }) {
  const errors = {};
  if (!name) errors.name = "Full name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (phone && !isValidPhone(phone)) errors.phone = "Enter a valid phone number.";
  if (!password) errors.password = "Password is required.";
  else if (!isStrongPassword(password)) errors.password = "Password must be at least 8 characters.";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export function validateInquiryForm({ name, email, message }) {
  const errors = {};
  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";
  if (!message) errors.message = "Please add a short message.";
  return errors;
}
