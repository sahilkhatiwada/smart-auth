type EmailProvider = (to: string, subject: string, body: string) => Promise<void>;
type SMSProvider = (to: string, message: string) => Promise<void>;

let emailProvider: EmailProvider = async (to, subject, body) => { console.log(`Email to ${to}: ${subject}\n${body}`); };
let smsProvider: SMSProvider = async (to, message) => { console.log(`SMS to ${to}: ${message}`); };

export function setEmailProvider(fn: EmailProvider) { emailProvider = fn; }
export function setSMSProvider(fn: SMSProvider) { smsProvider = fn; }

export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] || '');
}

export async function sendEmail(to: string, subject: string, template: string, vars: Record<string, string> = {}): Promise<void> {
  const body = renderTemplate(template, vars);
  return emailProvider(to, subject, body);
}

export async function sendSMS(to: string, template: string, vars: Record<string, string> = {}): Promise<void> {
  const message = renderTemplate(template, vars);
  return smsProvider(to, message);
} 