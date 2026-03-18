## ADDED Requirements

### Requirement: Update Display Name
The system SHALL allow an authenticated user to update their display name.

#### Scenario: Successful name update
- **WHEN** the user provides a new display name
- **THEN** the system updates the user's profile
- **AND** returns the updated user data

### Requirement: Update Password
The system SHALL allow an authenticated user to change their password by providing their current password and a new password.

#### Scenario: Successful password update
- **WHEN** the user provides the correct current password and a valid new password (minimum 6 characters)
- **THEN** the system updates the user's password hash
- **AND** returns a success confirmation

#### Scenario: Incorrect current password
- **WHEN** the user provides an incorrect current password
- **THEN** the system rejects the update
- **AND** returns an "Unauthorized" or "Invalid credentials" error

#### Scenario: New password too short
- **WHEN** the user provides a new password with fewer than 6 characters
- **THEN** the system rejects the update
- **AND** returns a validation error
