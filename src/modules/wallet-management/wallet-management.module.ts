import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletManagementController } from './wallet-management.controller';
import { WalletManagementService } from './wallet-management.service';
import { Wallet } from '../../entities/wallet.entity';
import { User } from '../../entities/user.entity';
import { CryptoService } from '../../services/crypto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, User])],
  controllers: [WalletManagementController],
  providers: [WalletManagementService, CryptoService],
  exports: [WalletManagementService],
})
export class WalletManagementModule {} 