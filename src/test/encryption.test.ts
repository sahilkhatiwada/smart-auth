import { encrypt, decrypt } from '../lib/encryption';

describe('encryption', () => {
  it('encrypts and decrypts a string', () => {
    const text = 'hello world';
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('throws on corrupted data', () => {
    expect(() => decrypt('corrupted')).toThrow();
  });

  it('encrypts and decrypts an empty string', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('encrypts and decrypts a large string', () => {
    const text = 'a'.repeat(10000);
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('throws on non-string input', () => {
    // @ts-expect-error
    expect(() => encrypt(null)).toThrow();
    // @ts-expect-error
    expect(() => encrypt(undefined)).toThrow();
    // @ts-expect-error
    expect(() => encrypt(123)).toThrow();
  });
}); 