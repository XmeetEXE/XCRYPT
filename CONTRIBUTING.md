# Contributing to XCRYPT

Thanks for considering a contribution.

## Before you start

- Open an issue to discuss significant changes before implementing them.
- Keep changes focused and explain the security or user-facing impact.
- Never commit plaintext secrets, real keys, credentials, personal data, or sensitive screenshots.
- Do not add telemetry, external requests, analytics, or dependencies without clearly documenting the privacy and security impact.

## Development

Requirements: Node.js 20+.

```sh
npm test
npm run check
npm start
```

No dependency installation is currently required. Add tests for bug fixes and new behavior. Prefer Node.js built-ins and established cryptographic primitives over custom cryptography.

## Pull requests

Include a concise description, motivation, test results, compatibility notes, and any security considerations. Keep documentation current. Avoid claiming that XCRYPT is “unhackable”, “military-grade”, or fully secure.

By submitting a contribution, you agree that your contribution is provided under the project's MIT License, unless stated otherwise and agreed with the maintainers.
