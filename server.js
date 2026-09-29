'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const ROOT = path.join(__dirname, 'public');
const MAX_FILE = 20 * 1024 * 1024;
const MAX_BODY = 29 * 1024 * 1024;

function send(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer', 'Cache-Control':'no-store', 'Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'" });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readJson(req) { return new Promise((resolve,reject)=>{ let data=''; req.on('data', chunk=>{ data+=chunk; if(Buffer.byteLength(data)>MAX_BODY){ reject(new Error('Request too large')); req.destroy(); } }); req.on('end',()=>{ try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('Invalid JSON')); } }); req.on('error',reject); }); }
function validText(v) { return typeof v === 'string' && v.length > 0 && Buffer.byteLength(v,'utf8') <= MAX_BODY; }
function encodeBase64Url(buffer) { return buffer.toString('base64url'); }
function decodeBase64Url(value, allowEmpty = false) {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0) || !/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) {
    throw new Error('Invalid encrypted package or key format');
  }
  const decoded = Buffer.from(value, 'base64url');
  if (encodeBase64Url(decoded) !== value) throw new Error('Invalid encrypted package or key format');
  return decoded;
}
function encryptBuffer(input) {
  if (!Buffer.isBuffer(input)) throw new Error('Input must be binary data');
  const key = crypto.randomBytes(32), nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(input), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Opaque binary envelope: version marker || nonce || tag || ciphertext.
  const packageText = encodeBase64Url(Buffer.concat([Buffer.from('XC1'), nonce, tag, ciphertext]));
  return { package: packageText, key: encodeBase64Url(key) };
}
function encrypt(text) {
  if (typeof text !== 'string') throw new Error('Text input must be a string');
  const result = encryptBuffer(Buffer.from(text, 'utf8'));
  // Text packages retain their v1.1 layout for backwards compatibility.
  const envelope = decodeBase64Url(result.package);
  const packageText = encodeBase64Url(Buffer.concat([envelope.subarray(3, 15), envelope.subarray(15, 31), envelope.subarray(31)]));
  return { package: packageText, key: result.key };
}
function decrypt(packageText, keyText) {
  const envelope = decodeBase64Url(packageText, true);
  const key = decodeBase64Url(keyText);
  if (key.length !== 32 || envelope.length < 28) throw new Error('Invalid encrypted package or key format');
  const nonce = envelope.subarray(0, 12), tag = envelope.subarray(12, 28), ciphertext = envelope.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
function decryptBuffer(packageText, keyText) {
  const envelope = decodeBase64Url(packageText, true);
  const key = decodeBase64Url(keyText.trim());
  if (key.length !== 32 || envelope.length < 31 || envelope.subarray(0,3).toString() !== 'XC1') throw new Error('Invalid encrypted file package or key format');
  const nonce = envelope.subarray(3,15), tag = envelope.subarray(15,31), ciphertext = envelope.subarray(31);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(req.headers.host && !/^127\.0\.0\.1(?::\d+)?$/.test(req.headers.host) && !/^localhost(?::\d+)?$/.test(req.headers.host)) return send(res,403,{error:'Local access only'});
  if(req.method==='GET' && (url.pathname==='/' || url.pathname==='/index.html')) { const html=fs.readFileSync(path.join(ROOT,'index.html')); return send(res,200,html.toString(),'text/html; charset=utf-8'); }
  if(req.method==='GET' && url.pathname==='/app.js') { const js=fs.readFileSync(path.join(ROOT,'app.js')); return send(res,200,js.toString(),'text/javascript; charset=utf-8'); }
  if(req.method==='GET' && url.pathname==='/api/health') return send(res,200,{status:'ok',host:HOST,port:PORT});
  if(req.method!=='POST' || !['/api/encrypt','/api/decrypt','/api/encrypt-file','/api/decrypt-file'].includes(url.pathname)) return send(res,404,{error:'Not found'});
  const origin=req.headers.origin;
  if(origin && !['http://127.0.0.1:'+PORT,'http://localhost:'+PORT].includes(origin)) return send(res,403,{error:'Cross-origin requests are not allowed.'});
  if(!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return send(res,415,{error:'Content-Type must be application/json.'});
  try {
    const body=await readJson(req);
    if(url.pathname==='/api/encrypt-file') {
      if (typeof body.data !== 'string' || typeof body.name !== 'string') return send(res,400,{error:'File data and filename are required.'});
      const bytes=Buffer.from(body.data,'base64');
      if (bytes.length > MAX_FILE || bytes.toString('base64') !== body.data) return send(res,400,{error:'Choose a file up to 20 MB.'});
      const result=encryptBuffer(bytes);
      return send(res,200,{...result,originalSize:bytes.length});
    }
    if(url.pathname==='/api/decrypt-file') {
      if(typeof body.package!=='string' || typeof body.key!=='string') return send(res,400,{error:'Encrypted package and key are required.'});
      const bytes=decryptBuffer(body.package,body.key);
      if(bytes.length > MAX_FILE) return send(res,400,{error:'Decrypted file exceeds 20 MB.'});
      return send(res,200,{data:bytes.toString('base64'),size:bytes.length});
    }
    if(url.pathname==='/api/encrypt') {
      if(!validText(body.text)) return send(res,400,{error:'Enter text (maximum 1 MB).'});
      const result=encrypt(body.text);
      return send(res,200,result);
    }
    if(typeof body.package!=='string' || typeof body.key!=='string') return send(res,400,{error:'Encrypted package and key are required.'});
    const text=decrypt(body.package,body.key.trim()); return send(res,200,{text});
  } catch(e) { return send(res,400,{error:e.message==='Unsupported state or unable to authenticate data'?'Decryption failed: wrong key or altered ciphertext.':e.message || 'Request failed.'}); }
});
if (require.main === module) {
  server.listen(PORT,HOST,()=>{ console.log(`\n XCRYPT local dashboard running at http://${HOST}:${PORT}`); console.log(' Press Ctrl+C to stop. Your text and keys are processed locally.\n'); });
}
module.exports = { server, encrypt, decrypt, encryptBuffer, decryptBuffer };
