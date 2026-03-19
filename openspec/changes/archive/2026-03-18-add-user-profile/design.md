## Context

Currently, users have no UI to manage their profile (display name) or change their password. The backend `UsersModule` provides basic CRUD for internal use but lacks endpoints for self-service profile management.

## Goals / Non-Goals

**Goals:**
- Implement self-service profile updates (displayName).
- Implement secure password updates (requires old password verification).
- Create a dedicated profile management UI.
- Ensure the frontend auth store stays synchronized with profile changes.

**Non-Goals:**
- Email change (requires verification flow, out of scope).
- Profile pictures (out of scope, using ui-avatars as fallback).
- Multi-factor authentication (MFA).

## Decisions

### 1. New `UsersController`
Create a dedicated controller for user actions.
- **Rationale**: Keeps `AuthModule` clean and focused on session/token logic.
- **Endpoint**: `PATCH /users/profile` for non-sensitive info, `PATCH /users/password` for security-sensitive info.

### 2. Password Verification for Updates
Require `oldPassword` in the request body for any password change.
- **Rationale**: Prevents account hijacking via open sessions.
- **Alternatives**: Using a separate "confirm identity" middleware, but a direct check in the service is more straightforward for this simple case.

### 3. Frontend Store Update
The React app will use `useAuthStore` to update the user object locally after a successful `PATCH /users/profile`.
- **Rationale**: Avoids a full page reload or unnecessary extra `/auth/me` call after an update.

### 4. Minimal Validation
Use `class-validator` DTOs in the NestJS backend to enforce business rules (min password length, non-empty display name).

## Risks / Trade-offs

- **[Risk]** Password lockout if user forgets old password. → **Mitigation** Currently no password reset flow exists; we should add one in a future track. For now, users must contact admin.
- **[Trade-off]** Not implementing email changes. → **Rationale** Email changes require complex verification to avoid account loss or takeover; keeping it out of scope for the first iteration.
