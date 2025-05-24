# Multi-Factor Authentication Implementation

This directory contains the implementation of the Multi-Factor Authentication (MFA) system for the Logware Security Platform.

## Overview

The MFA system provides an additional layer of security through a time-based one-time password (TOTP) verification process. The system has been integrated with Redux state management and includes error analytics and user preferences support.

## Components

- **MFAVerification.tsx**: Handles the UI and logic for verifying MFA codes
- **MFASetup.tsx**: Handles the UI and logic for setting up MFA
- **TwoFactorPage.tsx**: Main page that integrates the MFA verification flow
- **TwoFactorVerify.tsx**: Legacy component (to be deprecated in favor of MFAVerification)

## State Management

The authentication state is managed in the Redux store through `authSlice.ts`, which includes:

- MFA requirement state
- User ID during verification
- Verification ID for the MFA session
- Error handling for MFA-related actions

## Services

- **mfaService.ts**: Provides API endpoints for MFA operations (setup, verify, enable, disable)
- **authService.ts**: Handles authentication with MFA integration
- **errorAnalyticsService.ts**: Tracks authentication events including MFA verification attempts

## User Flow

1. User logs in with email/password
2. If MFA is required:
   - The user is redirected to the TwoFactorPage
   - User enters the verification code from their authenticator app
   - Upon successful verification, user is redirected to the dashboard
3. For MFA setup:
   - User navigates to account settings
   - User enables MFA through the MFASetup component
   - User scans the QR code with their authenticator app
   - User verifies the setup with a verification code

## Testing

To test the MFA implementation:

1. Ensure the backend services are running
2. Log in with credentials of a user with MFA enabled
3. Verify the redirection to the MFA verification page
4. Test both successful and unsuccessful verification attempts
5. Verify proper error messages are displayed
6. Check that analytics events are logged correctly

## Integration with User Preferences

The MFA settings are synchronized with user preferences through the preferences slice, allowing users to:

- Enable/disable MFA
- View MFA status
- Reset MFA if needed

## Security Considerations

- MFA tokens are short-lived and tied to specific user sessions
- Verification attempts are rate-limited on the backend
- Failed verification attempts are logged for security analysis
