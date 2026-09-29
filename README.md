# XCRYPT

<p align="center">
  <strong>Private by design. Local by default.</strong><br/>
  A lightweight, browser-based encryption workspace that runs on your own machine.
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.2.0-8b5cf6?style=for-the-badge" />
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20%2B-43853d?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="Encryption" src="https://img.shields.io/badge/encryption-AES--256--GCM-0f766e?style=for-the-badge" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-64748b?style=for-the-badge" />
</p>

<p align="center"><em>Encrypt text and files through a clean dashboard, with cryptographic operations handled locally by Node.js.</em></p>

---

## Overview

**XCRYPT** is a local-first encryption tool with a terminal-launched Node.js server and a browser dashboard. It uses Node.js' built-in cryptography APIs to encrypt and decrypt text or files with authenticated **AES-256-GCM**.

Start it on your computer, open the local dashboard, encrypt your content, and save the encrypted package and secret key separately.

> **Local-first means local processing—not complete device security.** XCRYPT is intended for personal use, learning, and experimentation. It has not been independently security-audited.

## Features

- **Text encryption** — encrypt and decrypt text in the browser dashboard.
- **File encryption** — encrypt files up to **20 MB** and decrypt .xcrypt packages.
- **AES-256-GCM** — authenticated encryption helps detect incorrect keys or modified encrypted data.
- **Fresh cryptographic values** — a new 256-bit key and 96-bit nonce are generated for encryption.
- **Opaque encrypted packages** — ciphertext is exported as a compact Base64url-style string/package, not readable JSON metadata.
- **Separate key handling** — the secret key is provided separately from the encrypted output.
- **Local-only server** — binds to 127.0.0.1 by default; no account or cloud service is required.
- **No third-party runtime dependencies** — uses Node.js built-ins.
- **Built-in safeguards** — request-size limits, validation, security headers, and basic host/origin checks.

## How it works

~~~text
Your text or file
       |
       v
XCRYPT dashboard (browser)
       |
       v
Local Node.js server (127.0.0.1)
       |
       v
AES-256-GCM encryption
       |
       +------> Encrypted package
       |
       +------> Secret key (save separately)
~~~

For text, the encrypted output is an opaque Base64url string. The package contains the nonce, authentication tag, and ciphertext in a compact format; it does not expose plaintext metadata as JSON.

For files, XCRYPT produces a .xcrypt package. The original filename and file type are not embedded in the opaque package, so choose an appropriate filename and extension when decrypting.

## Requirements

- **Node.js 20 or later** (Node.js 24 recommended)
- A modern web browser
- No separate database, account, cloud service, or npm install required

## Quick start

### 1. Get the project

~~~bash
git clone https://github.com/XmeetEXE/XCRYPT.git
cd XCRYPT
~~~

You can also download the repository as a ZIP and extract it.

### 2. Start XCRYPT

**Windows (Command Prompt)**

~~~bat
npm start
~~~

**macOS / Linux**

~~~bash
npm start
~~~

### 3. Open the dashboard

Visit **http://127.0.0.1:4173** in your browser.

Stop the server with Ctrl+C in the terminal.

To use another port:

**Windows (Command Prompt)**

~~~bat
set PORT=4174 && npm start
~~~

**macOS / Linux**

~~~bash
PORT=4174 npm start
~~~

## Using XCRYPT

### Encrypt text

1. Open the **Encrypt** section in the dashboard.
2. Enter the text you want to encrypt.
3. Select **Encrypt text**.
4. Save or copy the encrypted package and secret key separately.

### Decrypt text

1. Open the **Decrypt** section.
2. Provide the encrypted package.
3. Enter the matching secret key.
4. Select **Unlock text** to decrypt.

### Encrypt a file

1. Open the **File encryption** section.
2. Choose a file up to **20 MB**.
3. Start encryption and save the resulting .xcrypt package.
4. Store the secret key separately from that package.

### Decrypt a file

1. Open the **Decrypt** section and load the .xcrypt package.
2. Enter the matching secret key.
3. Choose an output filename with the correct extension.
4. Decrypt and save the recovered file.

**Important:** If you lose the secret key, XCRYPT cannot recover the original content. There is no password reset or key-recovery service.

## Security notes

XCRYPT uses authenticated AES-256-GCM, but your security also depends on how you handle your device, browser, keys, and exported files.

- Keep the secret key private and store it separately from the encrypted package.
- Anyone with both the matching key and encrypted package can decrypt the content.
- Do not expose the local server through a public interface, reverse proxy, tunnel, or port-forward.
- Avoid using XCRYPT on shared or untrusted computers.
- Local processing does not protect against malware, a compromised operating system, malicious browser extensions, screen capture, clipboard history, or access to your unlocked device.
- Browser memory, clipboard contents, downloads, and operating-system features may retain sensitive data after use.
- AES-GCM can detect tampering or an incorrect key; it does **not** verify who created or sent a package.
- File encryption carries file bytes through the local API as Base64-encoded JSON, increasing memory usage. The 20 MB cap helps limit this.
- XCRYPT has not undergone an independent security audit. Do not rely on it as the sole safeguard for safety-critical, regulated, enterprise, or high-value information without a suitable security review.

## Development

Run the test suite:

~~~bash
npm test
~~~

Run project checks:

~~~bash
npm run check
~~~

XCRYPT uses Node.js' built-in test runner and does not require third-party runtime packages.

## Project structure

~~~text
XCRYPT/
├── public/
│   ├── app.js
│   └── index.html
├── test/
│   └── crypto.test.js
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
├── package.json
└── server.js
~~~

## Contributing

Contributions, bug reports, and suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

Never include real secret keys, private keys, sensitive plaintext, or confidential user data in issues, pull requests, screenshots, tests, or logs.

## Reporting a security issue

Please follow [SECURITY.md](SECURITY.md). Avoid publishing exploit details or sensitive data in a public issue.

## License

XCRYPT is released under the [MIT License](LICENSE).

## Credits

Built by **MEET ZALA (XMEET)**.

<p align="center">
  <strong>XCRYPT</strong><br/>
  <sub>Your data. Your key. Your device.</sub>
</p>
