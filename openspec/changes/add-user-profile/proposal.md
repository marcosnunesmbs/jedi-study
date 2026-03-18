## Why

Users need a way to personalize their account information (display name) and maintain account security by updating their passwords directly within the application. Currently, these fields are set at registration and cannot be modified.

## What Changes

- New `Profile` screen in the web application.
- API endpoints to update user display name.
- API endpoints to update user password with current password verification.
- Navigation link to the profile screen in the application sidebar.
- Automatic UI updates when profile information changes.

## Capabilities

### New Capabilities
- `user-profile`: Manage user personal information and account settings including display name and password updates.

### Modified Capabilities
- `auth`: Update current user data retrieval to ensure profile changes are reflected in the session/store.

## Impact

- **API**: `UsersModule` (new controller/service methods), `AuthModule` (potential response structure alignment).
- **Web**: `AppShell` (navigation), `AuthStore` (state synchronization), new `ProfilePage` component.
- **Database**: No schema changes required (uses existing `User` entity fields), but requires new update operations.
