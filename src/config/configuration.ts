export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'aam_wallet_relay',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_PREFIX || 'aam:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },
  bullmq: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_QUEUE_DB || '1', 10),
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    max: parseInt(process.env.CACHE_MAX || '1000', 10), // 1000 items
    isGlobal: true,
  },
  bloomFilter: {
    size: parseInt(process.env.BLOOM_SIZE || '10000000', 10), // 10 million addresses
    errorRate: parseFloat(process.env.BLOOM_ERROR_RATE || '0.001'), // 0.1% false positive
  },
  blockchain: {
    ethereum: {
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/your-api-key',
      wsUrl: process.env.ETHEREUM_WS_URL || 'wss://eth-mainnet.ws.alchemyapi.io/v2/your-api-key',
      chainId: parseInt(process.env.ETHEREUM_CHAIN_ID || '1', 10),
    },
    websocket: {
      reconnectInterval: parseInt(process.env.WS_RECONNECT_INTERVAL || '5000', 10),
      maxReconnectAttempts: parseInt(process.env.WS_MAX_RECONNECT || '10', 10),
    },
  },
  performance: {
    batchSize: parseInt(process.env.BATCH_SIZE || '1000', 10),
    concurrency: parseInt(process.env.CONCURRENCY || '10', 10),
    timeout: parseInt(process.env.TIMEOUT || '30000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key-here',
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '1000', 10), // Increased for performance
    },
  },
}); 