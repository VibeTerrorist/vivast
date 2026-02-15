/**
 * Environment variables helper
 * 
 * Loads test credentials from environment variables
 * Supports both .env files (local) and CI environment variables
 */

// Load .env file in local development
if (process.env.CI !== 'true') {
  require('dotenv').config();
}

export const testCredentials = {
  valid: {
    email: process.env.TEST_EMAIL_VALID || '',
    password: process.env.TEST_PASSWORD_VALID || '',
  },
  // Invalid credentials are synthetic test values - no need to configure them
  invalid: {
    email: 'invalid-test-user@example.com',
    password: 'WrongPassword123!',
    emailIncorrectFormat: 'not-an-email-address',
  },
};

// Validation - ensure required credentials are present
if (!testCredentials.valid.email || !testCredentials.valid.password) {
  console.warn('⚠️  Warning: Valid test credentials not found in environment variables');
  console.warn('💡 Create a .env file based on .env.example and add your credentials');
}
