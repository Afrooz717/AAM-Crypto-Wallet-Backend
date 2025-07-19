import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @ApiProperty({ description: 'Wallet ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Wallet address' })
  @Column({ unique: true })
  @IsString()
  address: string;

  @ApiProperty({ description: 'Encrypted private key' })
  @Column()
  @IsString()
  encryptedPrivateKey: string;

  @ApiProperty({ description: 'Encrypted mnemonic phrase (12 words)' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  encryptedMnemonic?: string;

  @ApiProperty({ description: 'Derivation path index' })
  @Column({ default: 0 })
  @IsNumber()
  derivationIndex: number;

  @ApiProperty({ description: 'Wallet label/name' })
  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiProperty({ description: 'Is main wallet' })
  @Column({ default: false })
  @IsBoolean()
  isMain: boolean;

  @ApiProperty({ description: 'Wallet active status' })
  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: number;

  @ApiProperty({ description: 'Wallet creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.wallets)
  @JoinColumn({ name: 'userId' })
  user: User;
} 