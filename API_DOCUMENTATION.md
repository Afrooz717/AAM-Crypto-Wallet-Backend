# AAM Wallet Management API - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Setup & Configuration](#setup--configuration)
3. [Authentication Flow](#authentication-flow)
4. [API Endpoints](#api-endpoints)
5. [Complete Workflow Examples](#complete-workflow-examples)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)

---

## 🎯 Project Overview

**AAM Wallet Management API** is a secure NestJS-based wallet management system with HD wallet support. It provides complete wallet lifecycle management including creation, import, recovery, and address generation.

### Key Features
- ✅ HD Wallet with 12-word seed phrase
- ✅ Multiple address generation from single seed
- ✅ Wallet import (mnemonic/private key)
- ✅ Wallet recovery system
- ✅ JWT authentication
- ✅ Encrypted data storage
- ✅ One wallet per user policy

### Base URL
```
http://localhost:3000/api/v1
```

### Swagger Documentation
```
http://localhost:3000/api/v1/docs
```

---

## ⚙️ Setup & Configuration

### Environment Variables
Create `.env` file in project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=aam_wallet_relay

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Security Configuration
ENCRYPTION_KEY=your-32-character-encryption-key-here

# Application
PORT=3000
```

### Installation
```bash
npm install
npm run start:dev
```

---

## 🔐 Authentication Flow

### Step 1: User Registration
**Endpoint**: `POST /users/register`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, Country",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Step 2: User Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe"
  }
}
```

**Important**: Save the `access_token` for all subsequent API calls.

---

## 🔗 API Endpoints

### 1. User Management APIs

#### 1.1 Register User
- **Method**: `POST`
- **URL**: `/users/register`
- **Authentication**: Not required
- **Description**: Create a new user account

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, Country",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 1.2 Get User Profile
- **Method**: `GET`
- **URL**: `/users/profile`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Get authenticated user's profile

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, Country",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Authentication APIs

#### 2.1 User Login
- **Method**: `POST`
- **URL**: `/auth/login`
- **Authentication**: Not required
- **Description**: Authenticate user and get JWT token

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe"
  }
}
```

### 3. Wallet Management APIs

#### 3.1 Create Wallet
- **Method**: `POST`
- **URL**: `/wallet-management/create`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Create a new wallet with 12-word seed phrase

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "label": "My Main Wallet"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet created successfully. Please save your seed phrase securely!",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "My Main Wallet",
    "isMain": true,
    "seedPhrase": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Important**: 
- Save the `seedPhrase` securely - it's only shown once!
- Save the `privateKey` for the generated address
- This creates the main wallet for the user

#### 3.2 Import Wallet from Mnemonic
- **Method**: `POST`
- **URL**: `/wallet-management/import/mnemonic`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Import existing wallet using 12-word seed phrase

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "mnemonic": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
  "label": "Imported Wallet"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet imported successfully with seed phrase. You can now generate additional addresses.",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "Imported Wallet",
    "isMain": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3.3 Import Wallet from Private Key
- **Method**: `POST`
- **URL**: `/wallet-management/import/private-key`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Import single address using private key

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "label": "Imported Address"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet address imported successfully. Note: This wallet cannot generate additional addresses.",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "Imported Address",
    "isMain": true,
    "hasSeedPhrase": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3.4 Get My Wallet
- **Method**: `GET`
- **URL**: `/wallet-management/my-wallet`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Get user's wallet information

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet retrieved successfully",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "My Main Wallet",
    "isMain": true,
    "hasSeedPhrase": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3.5 Get Main Wallet
- **Method**: `GET`
- **URL**: `/wallet-management/main-wallet`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Get user's main wallet (throws error if no wallet)

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Main wallet retrieved successfully",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "My Main Wallet",
    "isMain": true,
    "hasSeedPhrase": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3.6 Update Wallet Label
- **Method**: `PUT`
- **URL**: `/wallet-management/wallet/update`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Update wallet label by address

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
  "label": "Updated Wallet Name"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet label updated successfully",
  "data": {
    "id": 1,
    "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
    "label": "Updated Wallet Name",
    "isMain": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 3.7 Generate Additional Addresses
- **Method**: `POST`
- **URL**: `/wallet-management/generate-addresses`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Generate one additional address from seed phrase

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**: Empty (no body required)

**Response**:
```json
{
  "success": true,
  "message": "Additional addresses generated successfully",
  "data": [
    {
      "id": 2,
      "address": "0x8ba1f109551bd432803012645ac136ddd64dba72",
      "label": "My Main Wallet - Address 2",
      "derivationIndex": 1,
      "privateKey": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:35:00.000Z"
}
```

**Important**: 
- Generates exactly one address per call
- Requires existing wallet with seed phrase
- Returns private key for the new address
- Auto-increments derivation index

#### 3.8 Get All Addresses
- **Method**: `GET`
- **URL**: `/wallet-management/addresses`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Get all addresses from user's seed phrase with private keys

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response**:
```json
{
  "success": true,
  "message": "Addresses retrieved successfully",
  "data": [
    {
      "id": 1,
      "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
      "label": "My Main Wallet",
      "derivationIndex": 0,
      "isMain": true,
      "hasSeedPhrase": true,
      "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "address": "0x8ba1f109551bd432803012645ac136ddd64dba72",
      "label": "My Main Wallet - Address 2",
      "derivationIndex": 1,
      "isMain": false,
      "hasSeedPhrase": true,
      "privateKey": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Important**: 
- Returns all addresses from the same seed phrase
- Decrypts and returns private keys for all addresses
- Requires wallet with seed phrase

#### 3.9 Recover Wallet
- **Method**: `POST`
- **URL**: `/wallet-management/recover`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Recover wallet using email and password

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "recovery@example.com",
  "password": "recoverypassword123",
  "label": "Recovered Wallet"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Wallet recovered successfully with all addresses",
  "data": {
    "message": "Successfully recovered 2 wallet addresses",
    "wallets": [
      {
        "id": 3,
        "address": "0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6",
        "label": "Recovered Wallet",
        "derivationIndex": 0,
        "isMain": true,
        "hasSeedPhrase": true,
        "createdAt": "2024-01-15T10:40:00.000Z"
      },
      {
        "id": 4,
        "address": "0x8ba1f109551bd432803012645ac136ddd64dba72",
        "label": "Recovered Wallet - Address 2",
        "derivationIndex": 1,
        "isMain": false,
        "hasSeedPhrase": true,
        "createdAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "totalAddresses": 2
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

#### 3.10 Delete Wallet
- **Method**: `DELETE`
- **URL**: `/wallet-management/wallet/:id`
- **Authentication**: Required (JWT Bearer Token)
- **Description**: Soft delete wallet

**Request Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**URL Parameters**:
- `id`: Wallet ID (integer)

**Response**:
```json
{
  "success": true,
  "message": "Wallet deleted successfully",
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

---

## 🔄 Complete Workflow Examples

### Workflow 1: New User - Create Wallet

#### Step 1: Register User
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "password": "securepass123",
    "phoneNumber": "+1234567890"
  }'
```

#### Step 2: Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

**Save the JWT token from response**

#### Step 3: Create Wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Alice Main Wallet"
  }'
```

**Save the seed phrase and private key from response**

#### Step 4: Generate Additional Addresses
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/generate-addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Step 5: Get All Addresses
```bash
curl -X GET http://localhost:3000/api/v1/wallet-management/addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Workflow 2: Existing User - Import Wallet

#### Step 1: Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "bobpass123"
  }'
```

#### Step 2: Import from Mnemonic
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/import/mnemonic \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mnemonic": "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about",
    "label": "Bob Imported Wallet"
  }'
```

#### Step 3: Generate Addresses
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/generate-addresses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Workflow 3: Import Single Address

#### Step 1: Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "charlie@example.com",
    "password": "charliepass123"
  }'
```

#### Step 2: Import from Private Key
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/import/private-key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "privateKey": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    "label": "Charlie Single Address"
  }'
```

### Workflow 4: Wallet Recovery

#### Step 1: Login with Recovery Account
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recovery@example.com",
    "password": "recoverypass123"
  }'
```

#### Step 2: Recover Wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/recover \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "original@example.com",
    "password": "originalpass123",
    "label": "Recovered Wallet"
  }'
```

---

## ❌ Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Bad Request",
  "error": "Invalid wallet ID. Must be a positive integer.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized",
  "error": "Invalid credentials",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Not Found",
  "error": "Wallet not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Conflict",
  "error": "User with this email already exists",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Codes Reference

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 400 | Bad Request | Invalid parameters, validation errors |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate data, business rule violation |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## 🔒 Security Considerations

### JWT Token Management
- **Expiration**: Tokens expire in 24 hours by default
- **Storage**: Store tokens securely (not in localStorage for production)
- **Refresh**: Implement token refresh mechanism for production

### Sensitive Data Handling
- **Seed Phrases**: Only returned during wallet creation
- **Private Keys**: Encrypted in database, decrypted only when needed
- **Passwords**: Hashed with bcrypt (salt rounds: 10)

### API Security
- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Enabled for cross-origin requests
- **Input Validation**: All inputs validated with class-validator
- **SQL Injection**: Protected by TypeORM parameterized queries

### Best Practices
1. **Never store seed phrases in plain text**
2. **Use HTTPS in production**
3. **Implement proper session management**
4. **Regular security audits**
5. **Monitor API usage and errors**

---

## 📊 API Response Format

All APIs follow a standardized response format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": string,
  "timestamp": string
}
```

### Response Fields
- **success**: Boolean indicating if the request was successful
- **message**: Human-readable message describing the result
- **data**: Response data (optional, only on success)
- **error**: Error details (optional, only on failure)
- **timestamp**: ISO 8601 timestamp of the response

---

## 🚀 Production Deployment

### Environment Setup
1. **Database**: Use production PostgreSQL instance
2. **JWT Secret**: Generate strong random secret
3. **Encryption Key**: Use 32-character random key
4. **HTTPS**: Enable SSL/TLS certificates
5. **Rate Limiting**: Adjust based on expected load

### Monitoring
1. **Logs**: Implement structured logging
2. **Metrics**: Monitor API performance
3. **Alerts**: Set up error notifications
4. **Backup**: Regular database backups

### Security Checklist
- [ ] HTTPS enabled
- [ ] Strong JWT secret
- [ ] Secure encryption key
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] Error handling implemented
- [ ] Database security configured
- [ ] CORS properly configured

---

## 📞 Support

For technical support and questions:
1. Check the Swagger documentation at `/api/v1/docs`
2. Review server logs for detailed error information
3. Verify all environment variables are correctly set
4. Ensure database connection is working

---

**🎯 This documentation covers all APIs and workflows for the AAM Wallet Management System. Follow the execution order and parameter requirements for successful integration.** 