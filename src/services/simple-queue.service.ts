import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';
import { SimpleCacheService } from './simple-cache.service';

export interface WalletJobData {
  address: string;
  userId: number;
  operation: 'create' | 'import' | 'delete' | 'update';
  data?: any;
}

export interface TransactionJobData {
  hash: string;
  from: string;
  to: string;
  amount: string;
  blockNumber: number;
}

@Injectable()
export class SimpleQueueService implements OnModuleInit {
  private walletQueue: WalletJobData[] = [];
  private transactionQueue: TransactionJobData[] = [];
  private isProcessing = false;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private cacheService: SimpleCacheService,
  ) {}

  async onModuleInit() {
    this.startProcessing();
  }

  /**
   * Start background processing
   */
  private startProcessing(): void {
    setInterval(() => {
      this.processQueues();
    }, 1000); // Process every second
  }

  /**
   * Process all queues
   */
  private async processQueues(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Process wallet operations
      while (this.walletQueue.length > 0) {
        const job = this.walletQueue.shift();
        if (job) {
          await this.processWalletJob(job);
        }
      }

      // Process transactions
      while (this.transactionQueue.length > 0) {
        const job = this.transactionQueue.shift();
        if (job) {
          await this.processTransactionJob(job);
        }
      }
    } catch (error) {
      console.error('❌ Error processing queues:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process wallet operation jobs
   */
  private async processWalletJob(job: WalletJobData): Promise<void> {
    const { address, userId, operation, data } = job;

    try {
      switch (operation) {
        case 'create':
          await this.cacheService.addWalletAddress(address);
          console.log(`✅ Added wallet ${address} to cache`);
          break;

        case 'delete':
          await this.cacheService.removeWalletAddress(address);
          console.log(`✅ Removed wallet ${address} from cache`);
          break;

        case 'update':
          await this.cacheService.addWalletAddress(address);
          console.log(`✅ Updated wallet ${address} in cache`);
          break;

        default:
          console.log(`⚠️ Unknown wallet operation: ${operation}`);
      }
    } catch (error) {
      console.error(`❌ Error processing wallet job:`, error);
    }
  }

  /**
   * Process blockchain transaction jobs
   */
  private async processTransactionJob(job: TransactionJobData): Promise<void> {
    const { hash, from, to, amount, blockNumber } = job;

    try {
      // Check if transaction involves AAM wallets
      const fromIsAAM = await this.cacheService.isAAMWallet(from);
      const toIsAAM = await this.cacheService.isAAMWallet(to);

      if (fromIsAAM || toIsAAM) {
        console.log(`🔍 AAM transaction detected: ${hash}`);
        
        // Here you would implement your transaction processing logic
        // For example: update balances, send notifications, etc.
      }
    } catch (error) {
      console.error(`❌ Error processing transaction job:`, error);
    }
  }

  /**
   * Add wallet operation to queue
   */
  async addWalletJob(data: WalletJobData): Promise<void> {
    this.walletQueue.push(data);
    console.log(`📥 Added wallet job to queue: ${data.operation} for ${data.address}`);
  }

  /**
   * Add transaction to queue
   */
  async addTransactionJob(data: TransactionJobData): Promise<void> {
    this.transactionQueue.push(data);
    console.log(`📥 Added transaction job to queue: ${data.hash}`);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    walletQueue: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    transactionQueue: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  }> {
    return {
      walletQueue: {
        waiting: this.walletQueue.length,
        active: this.isProcessing ? 1 : 0,
        completed: 0, // Would need to track
        failed: 0, // Would need to track
      },
      transactionQueue: {
        waiting: this.transactionQueue.length,
        active: this.isProcessing ? 1 : 0,
        completed: 0, // Would need to track
        failed: 0, // Would need to track
      },
    };
  }

  /**
   * Clear all queues
   */
  async clearQueues(): Promise<void> {
    this.walletQueue = [];
    this.transactionQueue = [];
    console.log('🧹 Cleared all queues');
  }
} 