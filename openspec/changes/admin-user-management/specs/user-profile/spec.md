# User Profile Specification Delta

## MODIFIED Requirements

### Requirement: Update Password
The system SHALL allow an authenticated user to change their password by providing their current password and a new password. All new passwords MUST follow the strong password policy (minimum 8 characters, containing both letters and numbers).

#### Scenario: Successful password update
- **WHEN** the user provides the correct current password and a valid new password (minimum 8 characters with letters and numbers)
- **THEN** the system updates the user's password hash
- **AND** returns a success confirmation

#### Scenario: Incorrect current password
- **WHEN** the user provides an incorrect current password
- **THEN** the system rejects the update
- **AND** returns an "Unauthorized" or "Invalid credentials" error

#### Scenario: New password too short or weak
- **WHEN** the user provides a new password with fewer than 8 characters, or lacking letters/numbers
- **THEN** the system rejects the update
- **AND** returns a validation error "Password must be at least 8 characters long and contain both letters and numbers"
