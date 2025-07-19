import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WalletManagementModule } from './modules/wallet-management/wallet-management.module';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { CryptoService } from './services/crypto.service';
import { SimpleCacheService } from './services/simple-cache.service';
import { SimpleQueueService } from './services/simple-queue.service';
import { SimpleBlockchainListenerService } from './services/simple-blockchain-listener.service';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000,
    }]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST') || 'localhost',
        port: configService.get('REDIS_PORT') || 6379,
        password: configService.get('REDIS_PASSWORD') || undefined,
        db: configService.get('REDIS_DB') || 0,
        keyPrefix: configService.get('REDIS_PREFIX') || 'aam:',
        ttl: configService.get('CACHE_TTL') || 3600,
        max: configService.get('CACHE_MAX') || 1000,
        isGlobal: true,
      } as any),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Wallet, Transaction],
        synchronize: true,
        logging: false,
        cache: {
          duration: 30000,
        },
        extra: {
          max: 20,
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Wallet, Transaction]),
    UsersModule,
    AuthModule,
    WalletManagementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    CryptoService, 
    SimpleCacheService,
    SimpleQueueService,
    SimpleBlockchainListenerService,
    JwtStrategy
  ],
  exports: [SimpleCacheService, SimpleQueueService, SimpleBlockchainListenerService],
})
export class AppModule {}
