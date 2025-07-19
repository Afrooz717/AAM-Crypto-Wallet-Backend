import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletManagementController } from './wallet-management.controller';
import { TransactionController } from './transaction.controller';
import { WalletManagementService } from './wallet-management.service';
import { TransactionService } from '../../services/transaction.service';
import { Wallet } from '../../entities/wallet.entity';
import { User } from '../../entities/user.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CryptoService } from '../../services/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User, Transaction])],
  controllers: [WalletManagementController, TransactionController],
  providers: [WalletManagementService, TransactionService, CryptoService],
  exports: [WalletManagementService, TransactionService],
})
export class WalletManagementModule {} 