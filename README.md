# XCRYPT

**Your data. Only your key.**

XCRYPT is a local-first, terminal-launched text encryption tool with a browser dashboard. It uses Node.js' built-in cryptography APIs and authenticated **AES-256-GCM** encryption. The application binds to loopback (`127.0.0.1`) and does not require an account, cloud service, database, or third-party runtime dependency.

> **Status:** v1.0.0 — text encryption/decryption MVP. File encryption, password-based key derivation, and key vaults are not included in this release.

## Features

- Fresh cryptographically secure 256-bit key and 96-bit nonce per encryption.
- AES-256-GCM authenticated encryption (integrity/authenticity check on decryption).
- Browser dashboard served by a local Node.js process.
- Export/copy an opaque Base64url encrypted-text package and secret key separately.
- No key persistence or network service integration.
- Request size limits, loopback binding, basic host/origin checks, security headers, and input validation.

## Requirements

- Node.js 20 or later (Node.js 24 recommended).
- A modern browser.
- No `npm install` is required; XCRYPT uses only Node.js built-ins.

## Run locally

### Windows (Command Prompt)

```bat
cd path\to\xcrypt-local
npm start
```

### macOS / Linux

```sh
cd /path/to/xcrypt-local
npm start
```

Open <http://127.0.0.1:4173>. Stop the server with `Ctrl+C`.

To use another port, set `PORT` before starting:

```bat
set PORT=4174 && npm start
```

```sh
PORT=4174 npm start
```

## Use

1. Open **Encrypt**, enter text, and select **Encrypt text**.
2. Save the encrypted text package and secret key separately.
3. To recover the text, open **Decrypt**, provide both values, and select **Unlock text**.

The encrypted package is a single opaque Base64url string. Internally, it concatenates a 12-byte nonce, a 16-byte AES-GCM authentication tag, and the ciphertext. No JSON fields or plaintext metadata are exposed in the package. The secret key is separate.

## Security model and limitations

- XCRYPT is intended for local, personal use and learning. It is **not independently audited** and should not be treated as a certified or enterprise-approved encryption product.
- “Localhost only” means the server listens on the same machine's loopback interface. It does not protect against malware, malicious browser extensions, a compromised operating system, screen capture, clipboard history, or someone with access to your unlocked device.
- Do not expose the port through a reverse proxy, tunnel, port-forward, or public interface. Do not run it on a shared or untrusted computer.
- Anyone with the secret key and encrypted package can decrypt the text. Anyone who obtains the key may read the protected content. Keep backups in trusted, access-controlled storage and store the key separately from the package.
- If the key is lost, XCRYPT cannot recover the original plaintext. There is no password reset or recovery service.
- AES-GCM detects modified ciphertext or an incorrect key, but encryption does not establish the identity of the sender or prove who created a package.
- Browser memory, clipboard, downloaded files, and the operating system may retain sensitive information after use. Clear these according to your device's practices.
- Do not use this release as the sole protection for safety-critical, regulated, or high-value data without an independent security review and an appropriate organizational process.

## Development and tests

```sh
npm test
npm run check
```

The project has no external package dependencies. Tests use Node.js' built-in test runner.

## Project structure

```text
xcrypt-local/
├── public/
│   ├── app.js
│   └── index.html
├── test/
│   └── crypto.test.js
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/ci.yml
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
├── package.json
└── server.js
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please do not submit real secrets, private keys, or sensitive plaintext in issues, tests, screenshots, or logs.

## Security reports

Please follow [SECURITY.md](SECURITY.md). Do not publish exploit details or sensitive user data in a public issue.

## License

XCRYPT is released under the [MIT License](LICENSE). Third-party components, if added in future, may have separate licenses.

---

Created by **MEET ZALA (XMEET)**.

## Publish on GitHub

1. Create an empty public repository named `xcrypt-local` under your GitHub account. Do not initialize it with another README, license, or `.gitignore`.
2. In this project folder, run:

   ```sh
   git init
   git add .
   git commit -m "chore: prepare XCRYPT v1.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/xcrypt-local.git
   git push -u origin main
   ```

3. Replace `YOUR-USERNAME` with your GitHub username. Review the repository's About description, topics, and release notes before publishing.
4. For a versioned release, create a Git tag and push it:

   ```sh
   git tag -a v1.0.0 -m "XCRYPT v1.0.0"
   git push origin v1.0.0
   ```

GitHub repository publication and release creation are actions you perform in your own account. Do not commit exported keys or private encrypted/plaintext samples.


## File encryption (v1.2.0)

Open the **File encryption** tab, choose a file (maximum 20 MB), and encrypt it. Save the `.xcrypt` package and secret key separately. To decrypt, open **Decrypt**, load or paste the package, enter the matching key, and choose an output filename. The original filename and file type are intentionally not embedded in the opaque package; choose the appropriate extension when saving. The local HTTP API currently carries file bytes as base64 JSON, so memory use is higher than the original file size and very large files are intentionally capped.

File encryption is authenticated AES-256-GCM, but the application has not undergone an independent security audit. Keep the key private, verify backups, and test recovery before relying on it for important data.
