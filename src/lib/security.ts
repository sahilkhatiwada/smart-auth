import fetch from 'node-fetch';
import crypto from 'crypto';

export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a digit');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain a special character');
  return { valid: errors.length === 0, errors };
}

export async function isPasswordBreached(password: string): Promise<boolean> {
  // Use k-Anonymity: only send first 5 chars of SHA1 hash
  const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const text = await res.text();
  return text.split('\n').some(line => line.startsWith(suffix));
}

export function getDeviceFingerprint(userAgent: string, ip: string): string {
  // Simple fingerprint: hash of userAgent + IP
  return crypto.createHash('sha256').update(userAgent + ip).digest('hex');
}

export function isNewDevice(fingerprint: string, knownFingerprints: string[]): boolean {
  return !knownFingerprints.includes(fingerprint);
}

export function shouldStepUpAuth(action: string, userRiskLevel: number): boolean {
  // Example: require step-up for sensitive actions or high risk
  const sensitiveActions = ['change-password', 'withdraw-funds', 'delete-account'];
  return sensitiveActions.includes(action) || userRiskLevel > 5;
}

// Usage:
// const { valid, errors } = validatePasswordStrength(password);
// const breached = await isPasswordBreached(password);
// const fingerprint = getDeviceFingerprint(req.headers['user-agent'], req.ip);
// if (isNewDevice(fingerprint, user.knownDevices)) { ... }
// if (shouldStepUpAuth('withdraw-funds', user.riskLevel)) { ... } 