import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsEmail, MinLength } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty({ 
    description: 'Wallet label/name',
    example: 'My Wallet',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class GenerateAddressesDto {
  @ApiProperty({ 
    description: 'Number of addresses to generate',
    example: 5,
    required: false
  })
  @IsOptional()
  @IsNumber()
  count?: number;
}

export class ImportWalletDto {
  @ApiProperty({ 
    description: 'Mnemonic phrase (12, 15, 18, 21, or 24 words)',
    example: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
    required: false
  })
  @IsOptional()
  @IsString()
  mnemonic?: string;

  @ApiProperty({ 
    description: 'Private key (with or without 0x prefix)',
    example: '0x1234567890abcdef...',
    required: false
  })
  @IsOptional()
  @IsString()
  privateKey?: string;

  @ApiProperty({ 
    description: 'Wallet label/name',
    example: 'My Wallet',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class RecoverWalletDto {
  @ApiProperty({ 
    description: 'Email address of the wallet owner',
    example: 'user@example.com',
    required: true
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Password for authentication',
    example: 'password123',
    required: true
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'Wallet label/name',
    example: 'Recovered Wallet',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
}

export class UpdateWalletDto {
  @ApiProperty({ 
    description: 'Wallet address',
    example: '0x1234567890abcdef...',
    required: true
  })
  @IsString()
  address: string;

  @ApiProperty({ 
    description: 'Wallet label/name',
    example: 'Updated Wallet Name',
    required: false
  })
  @IsOptional()
  @IsString()
  label?: string;
} 