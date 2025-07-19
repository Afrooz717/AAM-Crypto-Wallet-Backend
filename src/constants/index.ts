export const APP_CONSTANTS = {
  // API Versions
  API_VERSION: 'v1',
  API_PREFIX: 'api/v1',

  // JWT
  JWT_STRATEGY: 'jwt',
  JWT_AUTH_TYPE: 'Bearer',

  // Rate Limiting
  RATE_LIMIT_TTL: 60,
  RATE_LIMIT_LIMIT: 100,

  // Wallet
  MNEMONIC_LENGTH: 12,
  DERIVATION_PATH: "m/44'/60'/0'/0/0",

  // Encryption
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  ENCRYPTION_KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,

  // Error Messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    WALLET_NOT_FOUND: 'Wallet not found',
    INVALID_ADDRESS: 'Invalid address',
    ENCRYPTION_FAILED: 'Encryption failed',
    DECRYPTION_FAILED: 'Decryption failed',
  },

  // Success Messages
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    WALLET_CREATED: 'Wallet created successfully',
    WALLET_IMPORTED: 'Wallet imported successfully',
  },
};

 