import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { Transaction, TransactionStatus, TransactionType } from '../entities/transaction.entity';
import { Wallet } from '../entities/wallet.entity';
import { User } from '../entities/user.entity';
import { CryptoService } from './crypto.service';
import { SendTokenDto, SendTokenResponseDto, BalanceResponseDto, TransactionHistoryResponseDto } from '../modules/wallet-management/dto/transaction.dto';

@Injectable()
export class TransactionService {
  private provider: ethers.JsonRpcProvider;

  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cryptoService: CryptoService,
    private configService: ConfigService,
  ) {
    // Initialize Ethereum provider with fallback
    const rpcUrl = this.configService.get('ETHEREUM_RPC_URL') || 'https://eth.llamarpc.com';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Send tokens from user's wallet
   */
  async sendTokens(userId: number, sendTokenDto: SendTokenDto): Promise<SendTokenResponseDto> {
    try {
      // Get user's wallet
      const wallet = await this.walletRepository.findOne({
        where: { userId, isActive: true }
      });

      if (!wallet) {
        throw new NotFoundException('No active wallet found for user');
      }

      // Validate recipient address
      if (!ethers.isAddress(sendTokenDto.toAddress)) {
        throw new BadRequestException('Invalid recipient address');
      }

      // Check if recipient is the same as sender
      if (wallet.address.toLowerCase() === sendTokenDto.toAddress.toLowerCase()) {
        throw new BadRequestException('Cannot send tokens to your own address');
      }

      // Get wallet balance
      const balance = await this.getWalletBalance(wallet.address);
      const amountWei = ethers.parseEther(sendTokenDto.amount);

      // Check if user has sufficient balance
      if (ethers.getBigInt(balance.balanceWei) < ethers.getBigInt(amountWei)) {
        throw new BadRequestException('Insufficient balance');
      }

      // Decrypt private key
      const privateKey = this.cryptoService.decrypt(wallet.encryptedPrivateKey);

      // Create wallet instance
      const walletInstance = new ethers.Wallet(privateKey, this.provider);

      // Prepare transaction
      const gasLimit = sendTokenDto.gasLimit || 21000;
      const gasPrice = sendTokenDto.gasPrice ? ethers.parseUnits(sendTokenDto.gasPrice, 'wei') : await this.provider.getFeeData().then(fee => fee.gasPrice);

      const transaction = {
        to: sendTokenDto.toAddress,
        value: amountWei,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      };

      // Send transaction
      const tx = await walletInstance.sendTransaction(transaction);
      const receipt = await tx.wait();

      // Save transaction to database
      const transactionRecord = this.transactionRepository.create({
        hash: tx.hash,
        fromAddress: wallet.address,
        toAddress: sendTokenDto.toAddress,
        value: amountWei.toString(),
        gasPrice: gasPrice?.toString() || '0',
        gasLimit: gasLimit,
        gasUsed: receipt?.gasUsed ? Number(receipt.gasUsed) : 0,
        blockNumber: receipt?.blockNumber || undefined,
        status: TransactionStatus.CONFIRMED,
        type: TransactionType.SEND,
        note: sendTokenDto.note,
        userId: userId,
        walletId: wallet.id,
        confirmedAt: new Date(),
        transactionData: {
          nonce: tx.nonce,
          chainId: tx.chainId,
        }
      });

      await this.transactionRepository.save(transactionRecord);

      return {
        transactionHash: tx.hash,
        fromAddress: wallet.address,
        toAddress: sendTokenDto.toAddress,
        amount: amountWei.toString(),
        gasUsed: receipt?.gasUsed ? Number(receipt.gasUsed) : 0,
        status: TransactionStatus.CONFIRMED,
        blockNumber: receipt?.blockNumber || undefined,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error sending tokens:', error);
      
      // Save failed transaction
      if (error.transaction) {
        const wallet = await this.walletRepository.findOne({
          where: { userId, isActive: true }
        });

        if (wallet) {
          const failedTransaction = this.transactionRepository.create({
            hash: error.transaction.hash || `failed_${Date.now()}`,
            fromAddress: wallet.address,
            toAddress: sendTokenDto.toAddress,
            value: sendTokenDto.amount,
            gasPrice: sendTokenDto.gasPrice || '0',
            gasLimit: sendTokenDto.gasLimit || 21000,
            gasUsed: 0,
            status: TransactionStatus.FAILED,
            type: TransactionType.SEND,
            note: sendTokenDto.note,
            errorMessage: error.message,
            userId: userId,
            walletId: wallet.id,
            transactionData: { error: error.message }
          });

          await this.transactionRepository.save(failedTransaction);
        }
      }

      throw new BadRequestException(`Failed to send tokens: ${error.message}`);
    }
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(address: string): Promise<BalanceResponseDto> {
    try {
      // Clean and validate address
      const cleanAddress = address.trim().toLowerCase();
      
      // Basic address format validation
      if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
        throw new BadRequestException('Invalid wallet address format');
      }

      // Check if address contains only valid hex characters
      if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
        throw new BadRequestException('Invalid wallet address characters');
      }

      // Get balance from blockchain
      const balanceWei = await this.provider.getBalance(cleanAddress);
      const balanceEth = ethers.formatEther(balanceWei);

      return {
        address: cleanAddress,
        balanceWei: balanceWei.toString(),
        balanceEth: balanceEth,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting balance:', error);
      
      // Handle specific RPC errors
      if (error.code === 'SERVER_ERROR' || error.message.includes('Unauthorized')) {
        throw new BadRequestException('Unable to connect to blockchain network. Please try again later.');
      }
      
      throw new BadRequestException(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: number, limit: number = 10, page: number = 1): Promise<TransactionHistoryResponseDto[]> {
    try {
      const offset = (page - 1) * limit;

      const transactions = await this.transactionRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: offset,
        take: limit,
        relations: ['wallet']
      });

      return transactions.map(tx => ({
        hash: tx.hash,
        from: tx.fromAddress,
        to: tx.toAddress,
        value: tx.value,
        status: tx.status,
        blockNumber: tx.blockNumber || 0,
        timestamp: tx.createdAt.toISOString(),
        gasUsed: tx.gasUsed,
        type: tx.type,
      }));
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw new BadRequestException(`Failed to get transaction history: ${error.message}`);
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransactionByHash(hash: string, userId: number): Promise<TransactionHistoryResponseDto> {
    try {
      const transaction = await this.transactionRepository.findOne({
        where: { hash, userId },
        relations: ['wallet']
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      return {
        hash: transaction.hash,
        from: transaction.fromAddress,
        to: transaction.toAddress,
        value: transaction.value,
        status: transaction.status,
        blockNumber: transaction.blockNumber || 0,
        timestamp: transaction.createdAt.toISOString(),
        gasUsed: transaction.gasUsed,
        type: transaction.type,
      };
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new BadRequestException(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction statistics for user
   */
  async getTransactionStats(userId: number) {
    try {
      const [totalTransactions, totalSent, totalReceived] = await Promise.all([
        this.transactionRepository.count({ where: { userId } }),
        this.transactionRepository
          .createQueryBuilder('transaction')
          .select('SUM(CAST(transaction.value AS DECIMAL))', 'total')
          .where('transaction.userId = :userId AND transaction.type = :type', { userId, type: TransactionType.SEND })
          .getRawOne(),
        this.transactionRepository
          .createQueryBuilder('transaction')
          .select('SUM(CAST(transaction.value AS DECIMAL))', 'total')
          .where('transaction.userId = :userId AND transaction.type = :type', { userId, type: TransactionType.RECEIVE })
          .getRawOne(),
      ]);

      return {
        totalTransactions,
        totalSent: totalSent?.total || '0',
        totalReceived: totalReceived?.total || '0',
        successRate: await this.calculateSuccessRate(userId),
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      throw new BadRequestException(`Failed to get transaction stats: ${error.message}`);
    }
  }

  /**
   * Calculate transaction success rate
   */
  private async calculateSuccessRate(userId: number): Promise<number> {
    try {
      const [total, successful] = await Promise.all([
        this.transactionRepository.count({ where: { userId } }),
        this.transactionRepository.count({ where: { userId, status: TransactionStatus.CONFIRMED } }),
      ]);

      return total > 0 ? (successful / total) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(fromAddress: string, toAddress: string, amount: string): Promise<{ gasLimit: number; gasPrice: string; estimatedFee: string }> {
    try {
      const amountWei = ethers.parseEther(amount);
      
      const gasLimit = await this.provider.estimateGas({
        from: fromAddress,
        to: toAddress,
        value: amountWei,
      });

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      
      const estimatedFee = gasLimit * gasPrice;

      return {
        gasLimit: Number(gasLimit),
        gasPrice: gasPrice.toString(),
        estimatedFee: ethers.formatEther(estimatedFee),
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw new BadRequestException(`Failed to estimate gas: ${error.message}`);
    }
  }
} 