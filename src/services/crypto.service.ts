import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
const bip39 = require('bip39');
const HDKey = require('hdkey');
import * as crypto from 'crypto';
import { APP_CONSTANTS } from '../constants';

@Injectable()
export class CryptoService {
  private readonly encryptionKey: string;

  constructor(private configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('security.encryptionKey') || 
      'your-32-character-encryption-key-here';
  }

  /**
   * Generate a new wallet with mnemonic
   */
  generateWallet(): { address: string; privateKey: string; mnemonic: string } {
    // Generate mnemonic (128 bits = 12 words, 256 bits = 24 words)
    const mnemonic = bip39.generateMnemonic(128);
    
    // Generate seed from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    
    // Create HD wallet
    const hdkey = HDKey.fromMasterSeed(seed);
    const path = APP_CONSTANTS.DERIVATION_PATH;
    const childKey = hdkey.derive(path);
    
    if (!childKey.privateKey) {
      throw new Error('Failed to generate private key');
    }
    
    // Create wallet from private key
    const wallet = new ethers.Wallet(childKey.privateKey.toString('hex'));
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic,
    };
  }

  /**
   * Generate wallet address from mnemonic with specific index
   */
  generateAddressFromMnemonic(mnemonic: string, index: number = 0): { address: string; privateKey: string } {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const path = `${APP_CONSTANTS.DERIVATION_PATH}/${index}`;
    const childKey = hdkey.derive(path);
    
    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key from mnemonic');
    }
    
    const wallet = new ethers.Wallet(childKey.privateKey.toString('hex'));
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Generate multiple addresses from mnemonic
   */
  generateMultipleAddresses(mnemonic: string, count: number = 1): Array<{ address: string; privateKey: string; index: number }> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const addresses: Array<{ address: string; privateKey: string; index: number }> = [];
    for (let i = 0; i < count; i++) {
      const { address, privateKey } = this.generateAddressFromMnemonic(mnemonic, i);
      addresses.push({
        address,
        privateKey,
        index: i,
      });
    }

    return addresses;
  }

  /**
   * Import wallet from mnemonic
   */
  importWalletFromMnemonic(mnemonic: string): { address: string; privateKey: string } {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const path = APP_CONSTANTS.DERIVATION_PATH;
    const childKey = hdkey.derive(path);
    
    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key from mnemonic');
    }
    
    const wallet = new ethers.Wallet(childKey.privateKey.toString('hex'));
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  /**
   * Import wallet from private key
   */
  importWalletFromPrivateKey(privateKey: string): { address: string } {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        address: wallet.address,
      };
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.slice(0, 32)), iv);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Combine IV and encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(APP_CONSTANTS.ERRORS.ENCRYPTION_FAILED);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.slice(0, 32)), iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(APP_CONSTANTS.ERRORS.DECRYPTION_FAILED);
    }
  }

  /**
   * Validate Ethereum address
   */
  isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get wallet from encrypted data
   */
  getWalletFromEncrypted(encryptedPrivateKey: string): ethers.Wallet {
    const privateKey = this.decrypt(encryptedPrivateKey);
    return new ethers.Wallet(privateKey);
  }

  /**
   * Sign transaction
   */
  async signTransaction(wallet: ethers.Wallet, transaction: ethers.TransactionRequest): Promise<string> {
    return await wallet.signTransaction(transaction);
  }
} 