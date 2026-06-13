# Security Policy

## Supported versions

Security fixes are provided for the latest release on the `main` branch.

| Version | Supported |
| ------- | --------- |
| latest on `main` | yes |
| older tags | best effort |

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, report them privately to:

**[hello@agentruntime.io](mailto:hello@agentruntime.io)**

Include:

- A description of the issue and potential impact
- Steps to reproduce (proof of concept if available)
- Affected versions or commit SHA
- Your name and contact (optional), if you would like credit

We aim to acknowledge reports within **3 business days** and will work with you on a fix and coordinated disclosure when appropriate.

You can also use [GitHub private vulnerability reporting](https://github.com/agentruntime-io/Portico/security/advisories/new) if enabled on the repository.

## Scope

In scope:

- This repository (`agentruntime-io/Portico`) — the Portico renderer, build scripts, and bundled demo content
- Issues that affect self-hosted deployments (XSS in MDX rendering, path traversal in content resolution, etc.)

Out of scope:

- Vulnerabilities in your separate documentation content repository
- Misconfiguration of hosting (exposed env vars, weak deploy tokens) unless caused by Portico defaults or documentation gaps
- Third-party services (Vercel, GitHub, etc.) except where Portico integration is clearly at fault

## Safe harbor

We appreciate responsible disclosure and will not pursue legal action against researchers who follow this policy in good faith.
