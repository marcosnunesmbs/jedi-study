export const isStrongPassword = (password: string): boolean => {
  if (!password) return false;
  // Minimum 8 characters, at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

export const getPasswordErrorMessage = (password: string): string | null => {
  if (!password) return null;
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[a-zA-Z]/.test(password)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};
