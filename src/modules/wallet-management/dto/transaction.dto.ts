import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendTokenDto {
  @ApiProperty({
    description: 'Recipient wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(42)
  toAddress: string;

  @ApiProperty({
    description: 'Amount to send (in wei)',
    example: '1000000000000000000'
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiPropertyOptional({
    description: 'Gas limit for transaction',
    example: 21000
  })
  @IsOptional()
  @IsNumber()
  @Min(21000)
  gasLimit?: number;

  @ApiPropertyOptional({
    description: 'Gas price in wei',
    example: '20000000000'
  })
  @IsOptional()
  @IsString()
  gasPrice?: string;

  @ApiPropertyOptional({
    description: 'Transaction note/memo',
    example: 'Payment for services'
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  note?: string;
}

export class SendTokenResponseDto {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x1234567890abcdef...'
  })
  transactionHash: string;

  @ApiProperty({
    description: 'From address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7'
  })
  fromAddress: string;

  @ApiProperty({
    description: 'To address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  })
  toAddress: string;

  @ApiProperty({
    description: 'Amount sent',
    example: '1000000000000000000'
  })
  amount: string;

  @ApiProperty({
    description: 'Gas used',
    example: 21000
  })
  gasUsed: number;

  @ApiProperty({
    description: 'Transaction status',
    example: 'pending'
  })
  status: string;

  @ApiProperty({
    description: 'Block number',
    example: 12345678
  })
  blockNumber?: number;

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  timestamp: string;
}

export class GetBalanceDto {
  @ApiProperty({
    description: 'Wallet address to check balance',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(42)
  address: string;
}

export class BalanceResponseDto {
  @ApiProperty({
    description: 'Wallet address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  })
  address: string;

  @ApiProperty({
    description: 'Balance in wei',
    example: '1000000000000000000'
  })
  balanceWei: string;

  @ApiProperty({
    description: 'Balance in ETH',
    example: '1.0'
  })
  balanceEth: string;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  lastUpdated: string;
}

export class GetTransactionHistoryDto {
  @ApiPropertyOptional({
    description: 'Number of transactions to fetch',
    example: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
}

export class TransactionHistoryResponseDto {
  @ApiProperty({
    description: 'Transaction hash',
    example: '0x1234567890abcdef...'
  })
  hash: string;

  @ApiProperty({
    description: 'From address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7'
  })
  from: string;

  @ApiProperty({
    description: 'To address',
    example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  })
  to: string;

  @ApiProperty({
    description: 'Transaction value in wei',
    example: '1000000000000000000'
  })
  value: string;

  @ApiProperty({
    description: 'Transaction status',
    example: 'confirmed'
  })
  status: string;

  @ApiProperty({
    description: 'Block number',
    example: 12345678
  })
  blockNumber: number;

  @ApiProperty({
    description: 'Transaction timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'Gas used',
    example: 21000
  })
  gasUsed: number;

  @ApiProperty({
    description: 'Transaction type (send/receive)',
    example: 'send'
  })
  type: 'send' | 'receive';
} 