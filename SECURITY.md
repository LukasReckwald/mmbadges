# Security policy

mmbadges renders user-provided text into SVG images, so injection issues (for example script execution in a badge) are taken seriously.

## Reporting a vulnerability

Please **don't open a public issue**. Use GitHub's private reporting instead: **Security → Report a vulnerability** on this repository.

Include the badge URL or request that triggers the problem and what an attacker could do with it. You'll get an answer as soon as possible; this is a one-person project, so please allow a few days.

## Scope

- The badge service on `mmbadges.com` (worker in `worker/`, rendering in `src/`)
- The gallery website (`site/`)

Rate limits of third-party APIs (GitHub, npm, Codecov) and the availability of those services are out of scope.
