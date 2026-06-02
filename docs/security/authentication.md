# Authentication and Authorization

## Architecture Overview

- Auth mechanism: JWT Bearer token
- Password hashing: bcrypt
- Token claims:
  - `sub` (user UUID)
  - `role` (`user` or `admin`)
  - `exp`, `iat`
- Authorization:
  - `get_current_user` validates token and active user
  - `require_roles(...)` enforces RBAC at endpoint layer

## API Contracts

### Login

- Endpoint: `POST /api/v1/auth/login`
- Input: email + password
- Output: access token, token type, expires seconds

### Register

- Endpoint: `POST /api/v1/auth/register`
- Controlled by `ALLOW_REGISTRATION` and admin registration flags

### Current User

- Endpoint: `GET /api/v1/auth/me`
- Requires Bearer token

## RBAC Boundaries

- `user`: chat + own conversation access
- `admin`: monitoring/stats/users/documents/indexing endpoints
- Guardrails:
  - all `/admin/*` paths must explicitly use `require_roles(UserRole.ADMIN)`

## Security Considerations

- JWT secret:
  - must be set via environment secret
  - minimum 32 chars (enforced in settings)
- Token expiry:
  - default 30 minutes
  - short-lived token preferred for internal security baseline
- Account validation:
  - disabled/inactive users denied even with valid token
- SSO readiness:
  - `users.external_id` reserved for OIDC/SAML subject

## Known Risks and Recommendations

- No refresh-token flow yet:
  - recommendation: add refresh token with rotation/revocation
- No brute-force controls:
  - recommendation: add login rate limiting and lockout policy
- No MFA:
  - recommendation: enforce IdP MFA once SSO is integrated
