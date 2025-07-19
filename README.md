<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# AAM Wallet Management API

A secure **NestJS-based wallet management system** with HD wallet support. This enterprise-grade application provides complete wallet management with advanced security features.

## 🎯 **Core Features**

### **1. Complete Wallet Management**
- **In-App Wallet Creation**: Generate new wallets with 12-word mnemonic phrases
- **Wallet Import**: Support for importing existing wallets via mnemonic or private key
- **Multi-Wallet Support**: Users can manage multiple wallets with one designated as "main"
- **Secure Storage**: All sensitive data encrypted using AES-256-CBC

### **2. Authentication & Security**
- **JWT-based authentication** with Passport strategies
- **Role-based access control** (User/Admin roles)
- **Rate limiting** with configurable thresholds
- **Password hashing** with bcrypt
- **Advanced encryption** for wallet data

## 🛠️ **Technical Stack**

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Ethers.js 6 for wallet operations
- **Authentication**: JWT + Passport
- **Documentation**: Swagger/OpenAPI
- **Security**: bcryptjs, AES encryption
- **Validation**: class-validator, class-transformer

## 📋 **Prerequisites**

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## 🗄️ **Database Setup**

### Option 1: Using Docker (Recommended)
```bash
# Install Docker first if not installed
sudo apt install docker.io

# Start PostgreSQL container
docker run --name aam-wallet-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aam_wallet_relay \
  -p 5432:5432 \
  -d postgres:15
```

### Option 2: Local PostgreSQL Installation
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE aam_wallet_relay;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE aam_wallet_relay TO postgres;
\q
```

## 🚀 **Installation & Setup**

```bash
# Install dependencies
npm install

# Environment configuration
cp .env.example .env

# Update .env file with your configuration
```

## ⚙️ **Environment Configuration**

Create a `.env` file in the root directory:

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

## 🏃‍♂️ **Running the Application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📚 **API Documentation**

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api/v1/docs
- **API Base URL**: http://localhost:3000/api/v1

## 🔗 **Available Endpoints**

### **Authentication** (`/api/v1/auth/`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `GET /test-token` - JWT token validation

### **Users** (`/api/v1/users/`)
- `POST /register` - User registration
- `GET /profile` - Get user profile (requires JWT)

### **Wallet Management** (`/api/v1/wallet-management/`)
- `POST /create` - Create new wallet
- `POST /import/mnemonic` - Import from mnemonic
- `POST /import/private-key` - Import from private key
- `GET /my-wallets` - List user wallets
- `GET /main-wallet` - Get primary wallet
- `PUT /wallet/:id` - Update wallet
- `DELETE /wallet/:id` - Delete wallet



## 💡 **Example Usage**

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, City, Country"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### 3. Create a wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet-management/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "My Main Wallet",
    "isMain": true
  }'
```



## 🧪 **Testing**

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 **Project Structure**

```
src/
├── config/                 # Configuration management
│   └── configuration.ts
├── entities/              # Database models
│   ├── user.entity.ts
│   ├── wallet.entity.ts
│   └── transaction.entity.ts
├── common/                # Shared utilities
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   └── wallet-management/ # Wallet CRUD operations
├── services/             # Core business logic
│   └── crypto.service.ts
├── interfaces/           # TypeScript interfaces
├── constants/            # Application constants
└── main.ts              # Application entry point
```

## 🔐 **Security Features**

- **AES-256-CBC encryption** for sensitive wallet data
- **JWT token validation** with proper error handling
- **Input validation** with class-validator
- **Rate limiting** to prevent abuse
- **CORS configuration** for cross-origin requests
- **Password hashing** with bcrypt

## 🌐 **Blockchain Integration**

- **HD Wallet support** with BIP39/BIP44
- **Ethereum address generation** and validation
- **Private key management** with encryption
- **Mnemonic phrase support** for wallet backup

## 🚀 **Deployment**

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```bash
# Build Docker image
docker build -t aam-wallet-api .

# Run container
docker run -p 3000:3000 --env-file .env aam-wallet-api
```

## 📊 **Database Schema**

### Core Entities
- **User**: User accounts with role-based access
- **Wallet**: Encrypted wallet data with user relationships

### Key Features
- **Soft deletes** for data integrity
- **Audit trails** with timestamps
- **Foreign key relationships** for data consistency
- **Indexes** for optimal performance

## 🔧 **Configuration Options**

The system supports extensive configuration through environment variables:
- **Database settings** (host, port, credentials)
- **JWT configuration** (secret, expiration)
- **Blockchain settings** (RPC URL, contract addresses)
- **Security parameters** (encryption keys, rate limits)

## 🎯 **Business Logic**

### Wallet Management
- **Multi-wallet support** per user
- **Main wallet designation**
- **Secure import/export** functionality
- **Encrypted storage** of sensitive data
- **HD wallet generation** with BIP39/BIP44

## 📈 **Monitoring & Analytics**

- **User activity monitoring**
- **Error logging** and debugging
- **Wallet creation tracking**

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Support**

For support and questions:
- Check the API documentation at `/api/v1/docs`
- Review the logs for error details
- Ensure all environment variables are properly configured

---

**🚀 Ready to deploy!** This is a production-ready, enterprise-grade wallet management system with sophisticated gas relay functionality.
