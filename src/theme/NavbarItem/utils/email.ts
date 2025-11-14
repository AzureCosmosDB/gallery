// utils/email.ts
// Reusable email validation function

export function isValidEmail(email: string): boolean {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
