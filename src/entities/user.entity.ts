import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Wallet } from './wallet.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User full name' })
  @Column({ nullable: true })
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (hashed)' })
  @Column()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'User active status' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User phone number' })
  @Column({ nullable: true })
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ description: 'User address' })
  @Column({ nullable: true })
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Account creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];
} 