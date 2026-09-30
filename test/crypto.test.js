'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { encrypt, decrypt } = require('../server');

test('round trips plain text using opaque text package', () => {
  const text = 'my name is chat gpt gandu';
  const encrypted = encrypt(text);
  assert.equal(typeof encrypted.package, 'string');
  assert.match(encrypted.package, /^[A-Za-z0-9_-]+$/);
  assert.equal(decrypt(encrypted.package, encrypted.key), text);
});
test('generates a fresh key and package for each encryption', () => {
  const a = encrypt('same text'), b = encrypt('same text');
  assert.notEqual(a.key, b.key);
  assert.notEqual(a.package, b.package);
});
test('rejects a wrong key', () => {
  const result = encrypt('private'), wrongKey = encrypt('another').key;
  assert.throws(() => decrypt(result.package, wrongKey));
});
test('rejects tampered package', () => {
  const result = encrypt('private');
  const first = result.package[0] === 'A' ? 'B' : 'A';
  assert.throws(() => decrypt(first + result.package.slice(1), result.key));
});
test('rejects malformed packages and keys', () => {
  assert.throws(() => decrypt('{}', 'not-base64'));
  const result = encrypt('private');
  assert.throws(() => decrypt('bad*package', result.key));
  assert.throws(() => decrypt(result.package, 'YQ'));
});
test('supports empty plaintext at crypto layer', () => {
  const result = encrypt('');
  assert.equal(decrypt(result.package, result.key), '');
});

const { encryptBuffer, decryptBuffer, server } = require('../server');

test('round trips binary data with XC1 version marker', () => {
  const bytes = Buffer.from([0, 1, 2, 250, 255, 128, 77, 0, 13, 10]);
  const result = encryptBuffer(bytes);
  assert.equal(typeof result.package, 'string');
  assert.match(result.package, /^[A-Za-z0-9_-]+$/);
  const envelope = Buffer.from(result.package, 'base64url');
  assert.equal(envelope.subarray(0, 3).toString(), 'XC1');
  assert.deepEqual(decryptBuffer(result.package, result.key), bytes);
});

test('file packages reject wrong key, tampering, and text packages', () => {
  const result = encryptBuffer(Buffer.from('secret file bytes'));
  const otherKey = encryptBuffer(Buffer.from('x')).key;
  assert.throws(() => decryptBuffer(result.package, otherKey));
  const tampered = (result.package[0] === 'A' ? 'B' : 'A') + result.package.slice(1);
  assert.throws(() => decryptBuffer(tampered, result.key));
  const textPkg = encrypt('hello');
  assert.throws(() => decryptBuffer(textPkg.package, textPkg.key));
});

test('file HTTP endpoints round trip and reject bad keys', async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const post = (path, body) => new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = require('node:http').request({
      host: '127.0.0.1', port, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        const json = JSON.parse(data);
        if (res.statusCode >= 400) reject(new Error(json.error || ('HTTP ' + res.statusCode)));
        else resolve(json);
      });
    });
    req.on('error', reject);
    req.end(payload);
  });
  try {
    const data = Buffer.from('file-contents-123').toString('base64');
    const enc = await post('/api/encrypt-file', { data, name: 'note.txt' });
    assert.equal(typeof enc.package, 'string');
    assert.equal(enc.originalSize, 17);
    const dec = await post('/api/decrypt-file', { package: enc.package, key: enc.key });
    assert.equal(Buffer.from(dec.data, 'base64').toString(), 'file-contents-123');
    assert.equal(dec.size, 17);
    const wrongKey = encryptBuffer(Buffer.from('x')).key;
    await assert.rejects(post('/api/decrypt-file', { package: enc.package, key: wrongKey }), /Decryption failed/);
    await assert.rejects(post('/api/encrypt-file', { data: '!!!', name: 'x.bin' }), /20 MB/);
  } finally {
    server.close();
  }
});
