## 1. API - Users Module Enhancements

- [x] 1.1 Create `UpdateProfileDto` and `UpdatePasswordDto` with validation rules.
- [x] 1.2 Implement `updateProfile` and `updatePassword` methods in `UsersService`.
- [x] 1.3 Create `UsersController` with `PATCH /users/profile` and `PATCH /users/password` endpoints.
- [x] 1.4 Register `UsersController` in `UsersModule`.

## 2. Web - API Client and Store

- [x] 2.1 Create `apps/web/src/api/users.api.ts` with profile and password update methods.
- [x] 2.2 Update `useAuthStore` to include an `updateUser` action for local state synchronization.

## 3. Web - UI Components

- [x] 3.1 Create `ProfilePage.tsx` with sections for display name and password change.
- [x] 3.2 Add `ProfilePage` route to `App.tsx`.
- [x] 3.3 Add profile navigation link/entry to `AppShell.tsx` sidebar.

## 4. Verification

- [ ] 4.1 Test successful display name update and verify UI reflects the change.
- [ ] 4.2 Test password update with correct old password.
- [ ] 4.3 Test password update failure with incorrect old password.
- [ ] 4.4 Verify responsiveness of the new Profile page.
