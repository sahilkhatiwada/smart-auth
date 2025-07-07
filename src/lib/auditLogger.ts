export type AuthEventType =
  | 'login-success'
  | 'login-failure'
  | 'logout'
  | 'register'
  | 'password-change'
  | 'password-reset-request'
  | 'password-reset-success'
  | 'mfa-challenge'
  | 'mfa-failure'
  | 'user-blocked'
  | 'user-unblocked';

export interface AuthEvent {
  type: AuthEventType;
  username?: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
  details?: Record<string, any>;
}

type LoggerFn = (event: AuthEvent) => void | Promise<void>;

let loggers: LoggerFn[] = [];
const inMemoryLog: AuthEvent[] = [];

export function addAuditLogger(fn: LoggerFn) {
  loggers.push(fn);
}

export function removeAuditLogger(fn: LoggerFn) {
  loggers = loggers.filter(l => l !== fn);
}

export async function logAuthEvent(event: AuthEvent) {
  inMemoryLog.push(event);
  for (const logger of loggers) {
    await logger(event);
  }
}

export function getAuditLog(): AuthEvent[] {
  return [...inMemoryLog];
}

// Usage:
// addAuditLogger(event => externalService.send(event));
// await logAuthEvent({ type: 'login-success', username: 'alice', ip: '1.2.3.4', timestamp: Date.now() });
// const log = getAuditLog(); 