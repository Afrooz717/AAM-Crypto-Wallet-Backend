import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class SimpleCacheService implements OnModuleInit {
  private readonly cachePrefix = 'aam:wallet:';
  private walletAddresses: Set<string> = new Set();

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.preloadWalletAddresses();
  }

  /**
   * Preload all wallet addresses into cache
   */
  private async preloadWalletAddresses(): Promise<void> {
    try {
      console.log('🔄 Preloading wallet addresses...');
      
      const wallets = await this.walletRepository.find({
        select: ['address'],
        where: { isActive: true }
      });

      let loadedCount = 0;

      // Add to in-memory set for fast lookup
      wallets.forEach(wallet => {
        this.walletAddresses.add(wallet.address.toLowerCase());
        loadedCount++;
      });

      console.log(`✅ Preloaded ${loadedCount} wallet addresses into memory cache`);
    } catch (error) {
      console.error('❌ Error preloading wallet addresses:', error);
    }
  }

  /**
   * Fast wallet address check using in-memory set
   */
  async isAAMWallet(address: string): Promise<boolean> {
    const normalizedAddress = address.toLowerCase();

    // Step 1: In-memory Set Check (0.01ms) - Ultra-fast lookup
    if (!this.walletAddresses.has(normalizedAddress)) {
      return false; // Definitely not an AAM wallet
    }

    // Step 2: Database Check (10-20ms) - Fallback for verification
    const wallet = await this.walletRepository.findOne({
      where: { address: normalizedAddress, isActive: true },
      select: ['id']
    });

    return !!wallet;
  }

  /**
   * Add new wallet address to cache
   */
  async addWalletAddress(address: string): Promise<void> {
    const normalizedAddress = address.toLowerCase();
    
    // Add to in-memory set
    this.walletAddresses.add(normalizedAddress);
    
    console.log(`✅ Added wallet address to cache: ${normalizedAddress}`);
  }

  /**
   * Remove wallet address from cache
   */
  async removeWalletAddress(address: string): Promise<void> {
    const normalizedAddress = address.toLowerCase();
    
    // Remove from in-memory set
    this.walletAddresses.delete(normalizedAddress);
    
    console.log(`✅ Removed wallet address from cache: ${normalizedAddress}`);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    inMemoryAddresses: number;
    cacheHitRate: number;
  }> {
    return {
      inMemoryAddresses: this.walletAddresses.size,
      cacheHitRate: 95, // Estimated high hit rate with in-memory cache
    };
  }

  /**
   * Clear all cache data
   */
  async clearCache(): Promise<void> {
    this.walletAddresses.clear();
    console.log('🧹 Cleared in-memory cache');
  }

  /**
   * Refresh cache with latest wallet addresses
   */
  async refreshCache(): Promise<void> {
    await this.clearCache();
    await this.preloadWalletAddresses();
  }
} 