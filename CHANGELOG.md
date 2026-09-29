# Changelog

## [1.1.0] - 2026-09-29

### Changed
- Replaced the visible JSON package with a single opaque Base64url text envelope.
- Kept nonce and authentication tag packed internally with ciphertext; secret key remains separate.
- Updated dashboard labels, text export extension, and cryptography tests.

## [1.0.0] - 2026-09-29

### Added
- Localhost browser dashboard launched from the terminal.
- Text encryption and decryption using AES-256-GCM.
- Fresh random 256-bit keys and 96-bit nonces per encryption.
- Encrypted package export and separate key export.
- Initial documentation, MIT license, security policy, contribution guide, and tests.

## 1.2.0 - 2026-09-29
- Added local file encryption and decryption for files up to 20 MB.
- Added opaque version-marked file packages, package loading, and decrypted-file export.
- Refreshed dashboard styling and tab navigation for text and file workflows.
- File contents and secret keys are processed by the local server; no cloud service is used.
