import { Injectable, BadRequestException, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Wallet } from '../../entities/wallet.entity';
import { User } from '../../entities/user.entity';
import { CryptoService } from '../../services/crypto.service';
import { CreateWalletDto, ImportWalletDto, UpdateWalletDto, RecoverWalletDto } from './dto/wallet.dto';
import { APP_CONSTANTS } from '../../constants';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class WalletManagementService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}

  /**
   * Create a new wallet with seed phrase (only one wallet per user)
   */
  async createWallet(userId: number, createWalletDto: CreateWalletDto) {
    // Check if user already has a wallet
    const existingWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true }
    });

    if (existingWallet) {
      throw new BadRequestException('User can only have one wallet. You already have a wallet.');
    }

    // Generate new wallet with 12-word seed phrase
    const { address, privateKey, mnemonic } = this.cryptoService.generateWallet();

    // Encrypt sensitive data
    const encryptedPrivateKey = this.cryptoService.encrypt(privateKey);
    const encryptedMnemonic = this.cryptoService.encrypt(mnemonic);

    // Create wallet record (always main wallet since only one allowed)
    const wallet = this.walletRepository.create({
      address: address.toLowerCase(),
      encryptedPrivateKey,
      encryptedMnemonic,
      derivationIndex: 0, // First address from seed phrase
      label: createWalletDto.label || `My Wallet`,
      isMain: true, // Always main since only one wallet
      userId,
    });

    const savedWallet = await this.walletRepository.save(wallet);

    // Return wallet info with seed phrase and private key (only for creation)
    return {
      id: savedWallet.id,
      address: savedWallet.address,
      label: savedWallet.label,
      isMain: savedWallet.isMain,
      seedPhrase: mnemonic, // Return seed phrase for user to save
      privateKey: privateKey, // Return private key for the generated address
      createdAt: savedWallet.createdAt,
    };
  }

  /**
   * Import wallet from mnemonic
   */
  async importFromMnemonic(userId: number, importWalletDto: ImportWalletDto) {
    if (!importWalletDto.mnemonic) {
      throw new BadRequestException('Mnemonic is required');
    }

    // Import wallet from mnemonic
    const { address, privateKey } = this.cryptoService.importWalletFromMnemonic(importWalletDto.mnemonic);

    // Check if wallet address already exists
    const existingAddressWallet = await this.walletRepository.findOne({
      where: { address: address.toLowerCase() }
    });

    if (existingAddressWallet) {
      throw new ConflictException('Wallet address already exists');
    }

    // Check if user already has a wallet
    const existingUserWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true }
    });

    // Encrypt sensitive data
    const encryptedPrivateKey = this.cryptoService.encrypt(privateKey);
    const encryptedMnemonic = this.cryptoService.encrypt(importWalletDto.mnemonic);

    let savedWallet;

    if (existingUserWallet) {
      // Update existing wallet with imported data
      existingUserWallet.address = address.toLowerCase();
      existingUserWallet.encryptedPrivateKey = encryptedPrivateKey;
      existingUserWallet.encryptedMnemonic = encryptedMnemonic;
      existingUserWallet.label = importWalletDto.label || `Imported Wallet`;
      existingUserWallet.derivationIndex = 0;
      
      savedWallet = await this.walletRepository.save(existingUserWallet);
    } else {
      // Create new wallet record
    const wallet = this.walletRepository.create({
      address: address.toLowerCase(),
      encryptedPrivateKey,
      encryptedMnemonic,
        derivationIndex: 0,
        label: importWalletDto.label || `My Wallet`,
        isMain: true,
      userId,
    });

      savedWallet = await this.walletRepository.save(wallet);
    }

    // Return wallet info without sensitive data
    return {
      id: savedWallet.id,
      address: savedWallet.address,
      label: savedWallet.label,
      isMain: savedWallet.isMain,
      createdAt: savedWallet.createdAt,
    };
  }

  /**
   * Import wallet address from private key
   */
  async importFromPrivateKey(userId: number, importWalletDto: ImportWalletDto) {
    if (!importWalletDto.privateKey) {
      throw new BadRequestException('Private key is required');
    }

    // Import wallet address from private key
    const { address } = this.cryptoService.importWalletFromPrivateKey(importWalletDto.privateKey);

    // Check if wallet address already exists
    const existingAddressWallet = await this.walletRepository.findOne({
      where: { address: address.toLowerCase() }
    });

    if (existingAddressWallet) {
      throw new ConflictException('Wallet address already exists');
    }

    // Check if user already has a wallet
    const existingUserWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true }
    });

    // Encrypt private key
    const encryptedPrivateKey = this.cryptoService.encrypt(importWalletDto.privateKey);

    let savedWallet;

    if (existingUserWallet) {
      // Update existing wallet with imported data
      existingUserWallet.address = address.toLowerCase();
      existingUserWallet.encryptedPrivateKey = encryptedPrivateKey;
      existingUserWallet.encryptedMnemonic = undefined; // No seed phrase for private key import
      existingUserWallet.label = importWalletDto.label || `Imported Address`;
      existingUserWallet.derivationIndex = 0;
      
      savedWallet = await this.walletRepository.save(existingUserWallet);
    } else {
      // Create new wallet record (no seed phrase, only private key)
    const wallet = this.walletRepository.create({
      address: address.toLowerCase(),
      encryptedPrivateKey,
        encryptedMnemonic: undefined, // No seed phrase for private key import
        derivationIndex: 0,
        label: importWalletDto.label || `Imported Address`,
        isMain: true,
      userId,
    });

      savedWallet = await this.walletRepository.save(wallet);
    }

    // Return wallet info without sensitive data
    return {
      id: savedWallet.id,
      address: savedWallet.address,
      label: savedWallet.label,
      isMain: savedWallet.isMain,
      hasSeedPhrase: false, // Indicate this wallet has no seed phrase
      createdAt: savedWallet.createdAt,
    };
  }

  /**
   * Get user wallet (only one wallet per user)
   */
  async getUserWallets(userId: number) {
    const wallet = await this.walletRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!wallet) {
      return null;
    }

    return {
      id: wallet.id,
      address: wallet.address,
      label: wallet.label,
      isMain: wallet.isMain,
      hasSeedPhrase: !!wallet.encryptedMnemonic,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Get user main wallet (only one wallet per user)
   */
  async getMainWallet(userId: number) {
    const wallet = await this.walletRepository.findOne({
      where: { userId, isActive: true }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      id: wallet.id,
      address: wallet.address,
      label: wallet.label,
      isMain: wallet.isMain,
      hasSeedPhrase: !!wallet.encryptedMnemonic,
      createdAt: wallet.createdAt,
    };
  }

  /**
   * Update wallet by address (only one wallet per user)
   */
  async updateWalletByAddress(userId: number, updateWalletDto: UpdateWalletDto) {
    const wallet = await this.walletRepository.findOne({
      where: { address: updateWalletDto.address.toLowerCase(), userId, isActive: true }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found with this address');
    }

    // Update wallet label
    if (updateWalletDto.label) {
      wallet.label = updateWalletDto.label;
    }
    
    const updatedWallet = await this.walletRepository.save(wallet);

    return {
      id: updatedWallet.id,
      address: updatedWallet.address,
      label: updatedWallet.label,
      isMain: updatedWallet.isMain,
      createdAt: updatedWallet.createdAt,
    };
  }

  /**
   * Delete wallet
   */
  async deleteWallet(walletId: number, userId: number) {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId, userId, isActive: true }
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // Soft delete by setting isActive to false
    wallet.isActive = false;
    await this.walletRepository.save(wallet);
  }

  /**
   * Generate additional addresses from user's seed phrase
   */
  async generateAdditionalAddresses(userId: number) {
    // Find user's main wallet with seed phrase
    const mainWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true, encryptedMnemonic: Not(IsNull()) },
      order: { derivationIndex: 'ASC' }
    });

    if (!mainWallet) {
      throw new NotFoundException('No wallet with seed phrase found. Please create or import a wallet with seed phrase first.');
    }

    if (!mainWallet.encryptedMnemonic) {
      throw new BadRequestException('This wallet does not have a seed phrase. Only wallets imported with seed phrase can generate additional addresses.');
    }

    // Decrypt mnemonic
    const mnemonic = this.cryptoService.decrypt(mainWallet.encryptedMnemonic);

    // Get the highest derivation index to continue from
    const highestIndexWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true, encryptedMnemonic: mainWallet.encryptedMnemonic },
      order: { derivationIndex: 'DESC' }
    });

    const startIndex = highestIndexWallet ? highestIndexWallet.derivationIndex + 1 : 0;

    // Generate new address starting from the next available index (1 address at a time)
    const newAddresses: Array<{ address: string; privateKey: string; index: number }> = [];
    const index = startIndex;
    const { address, privateKey } = this.cryptoService.generateAddressFromMnemonic(mnemonic, index);
    newAddresses.push({ address, privateKey, index });
    
    const createdWallets: Array<{
      id: number;
      address: string;
      label: string;
      derivationIndex: number;
      privateKey: string;
      createdAt: Date;
    }> = [];

    for (const addr of newAddresses) {
      // Check if address already exists
      const existingWallet = await this.walletRepository.findOne({
        where: { address: addr.address.toLowerCase() }
      });

      if (existingWallet) {
        continue; // Skip if address already exists
      }

      // Encrypt private key
      const encryptedPrivateKey = this.cryptoService.encrypt(addr.privateKey);

      // Create new wallet record
      const newWallet = this.walletRepository.create({
        address: addr.address.toLowerCase(),
        encryptedPrivateKey,
        encryptedMnemonic: mainWallet.encryptedMnemonic, // Same seed phrase
        derivationIndex: addr.index,
        label: `${mainWallet.label || 'My Wallet'} - Address ${addr.index + 1}`,
        isMain: false,
        userId,
      });

      const savedWallet = await this.walletRepository.save(newWallet);
      
      createdWallets.push({
        id: savedWallet.id,
        address: savedWallet.address,
        label: savedWallet.label || `Address ${addr.index + 1}`,
        derivationIndex: savedWallet.derivationIndex,
        privateKey: addr.privateKey, // Return private key for new addresses
        createdAt: savedWallet.createdAt,
      });
    }

    return createdWallets;
  }

  /**
   * Get all addresses from user's seed phrase with private keys
   */
  async getAddressesFromSeedPhrase(userId: number) {
    // Find user's main wallet with seed phrase
    const mainWallet = await this.walletRepository.findOne({
      where: { userId, isActive: true, encryptedMnemonic: Not(IsNull()) },
      order: { derivationIndex: 'ASC' }
    });

    if (!mainWallet) {
      throw new NotFoundException('No wallet with seed phrase found. Please create or import a wallet with seed phrase first.');
    }

    if (!mainWallet.encryptedMnemonic) {
      throw new BadRequestException('This wallet does not have a seed phrase. Only wallets imported with seed phrase can have multiple addresses.');
    }

    // Get all wallets with same seed phrase
    const allWallets = await this.walletRepository.find({
      where: { 
        encryptedMnemonic: mainWallet.encryptedMnemonic,
        userId,
        isActive: true 
      },
      order: { derivationIndex: 'ASC' }
    });

    return allWallets.map(w => ({
      id: w.id,
      address: w.address,
      label: w.label,
      derivationIndex: w.derivationIndex,
      isMain: w.isMain,
      hasSeedPhrase: !!w.encryptedMnemonic,
      privateKey: this.cryptoService.decrypt(w.encryptedPrivateKey), // Decrypt and return private key
      createdAt: w.createdAt,
    }));
  }

  /**
   * Recover wallet using email and password
   * This method finds the wallet by email/password and imports all addresses
   */
  async recoverWallet(userId: number, recoverWalletDto: RecoverWalletDto) {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: recoverWalletDto.email.toLowerCase() }
    });

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(recoverWalletDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Find all wallets for this user
    const existingWallets = await this.walletRepository.find({
      where: { userId: user.id, isActive: true },
      order: { derivationIndex: 'ASC' }
    });

    if (existingWallets.length === 0) {
      throw new NotFoundException('No wallets found for this user');
    }

    // Return all wallet addresses with private keys
    return existingWallets.map(wallet => ({
      id: wallet.id,
      address: wallet.address,
      label: wallet.label,
      derivationIndex: wallet.derivationIndex,
      isMain: wallet.isMain,
      hasSeedPhrase: !!wallet.encryptedMnemonic,
      privateKey: this.cryptoService.decrypt(wallet.encryptedPrivateKey), // Decrypt and return private key
      createdAt: wallet.createdAt,
    }));
  }
} 