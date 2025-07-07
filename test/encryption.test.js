const { encrypt, decrypt } = require('../lib/encryption');

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
}); 