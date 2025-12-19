// src/utils/passwordValidator.js
const zxcvbn = require('zxcvbn');
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'letmein', '111111', '123123', 'iloveyou', 'admin',
  'welcome', 'monkey', 'login', 'football', '1234567', '12345678', '1234', '12345'
];
function validatePassword(password) {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'], score: 0 };
  }
  if (password.length < 8) { errors.push('Password must be at least 8 characters long'); }
  if (!/[A-Z]/.test(password)) { errors.push('Password must include at least one uppercase letter'); }
  if (!/[a-z]/.test(password)) { errors.push('Password must include at least one lowercase letter'); }
  if (!/[0-9]/.test(password)) { errors.push('Password must include at least one digit'); }
  if (!/[^a-zA-Z0-9]/.test(password)) { errors.push('Password must include at least one special character'); }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) { errors.push('Password is too common'); }
  const { score, feedback } = zxcvbn(password);
  if (score < 3) { errors.push('Password is too weak: ' + (feedback.warning || 'Add more complexity')); }
  return { valid: errors.length === 0, errors, score };
}
module.exports = { validatePassword };

