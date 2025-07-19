import { Controller, Post, Get, Body, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransactionService } from '../../services/transaction.service';
import { 
  SendTokenDto, 
  SendTokenResponseDto, 
  BalanceResponseDto, 
  GetBalanceDto,
  GetTransactionHistoryDto,
  TransactionHistoryResponseDto 
} from './dto/transaction.dto';

@ApiTags('Transaction Management')
@Controller('api/v1/transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send tokens to another address' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tokens sent successfully',
    type: SendTokenResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async sendTokens(
    @Request() req,
    @Body() sendTokenDto: SendTokenDto
  ): Promise<SendTokenResponseDto> {
    return await this.transactionService.sendTokens(req.user.id, sendTokenDto);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid address' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'address', description: 'Wallet address to check balance', example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' })
  async getBalance(@Query('address') address: string): Promise<BalanceResponseDto> {
    if (!address) {
      throw new Error('Address parameter is required');
    }
    return await this.transactionService.getWalletBalance(address);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user transaction history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction history retrieved successfully',
    type: [TransactionHistoryResponseDto] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to fetch', example: 10 })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  async getTransactionHistory(
    @Request() req,
    @Query('limit') limit: number = 10,
    @Query('page') page: number = 1
  ): Promise<TransactionHistoryResponseDto[]> {
    return await this.transactionService.getTransactionHistory(req.user.id, limit, page);
  }

  @Get('history/:hash')
  @ApiOperation({ summary: 'Get specific transaction by hash' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction retrieved successfully',
    type: TransactionHistoryResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionByHash(
    @Request() req,
    @Param('hash') hash: string
  ): Promise<TransactionHistoryResponseDto> {
    return await this.transactionService.getTransactionByHash(hash, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user transaction statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTransactions: { type: 'number', example: 25 },
        totalSent: { type: 'string', example: '5000000000000000000' },
        totalReceived: { type: 'string', example: '3000000000000000000' },
        successRate: { type: 'number', example: 96.5 }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionStats(@Request() req) {
    return await this.transactionService.getTransactionStats(req.user.id);
  }

  @Post('estimate-gas')
  @ApiOperation({ summary: 'Estimate gas for a transaction' })
  @ApiResponse({ 
    status: 200, 
    description: 'Gas estimation successful',
    schema: {
      type: 'object',
      properties: {
        gasLimit: { type: 'number', example: 21000 },
        gasPrice: { type: 'string', example: '20000000000' },
        estimatedFee: { type: 'string', example: '0.00042' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async estimateGas(
    @Body() body: { fromAddress: string; toAddress: string; amount: string }
  ) {
    return await this.transactionService.estimateGas(
      body.fromAddress,
      body.toAddress,
      body.amount
    );
  }

  @Get('my-balance')
  @ApiOperation({ summary: 'Get current user wallet balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance retrieved successfully',
    type: BalanceResponseDto 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  async getMyBalance(@Request() req): Promise<BalanceResponseDto> {
    // Get user's wallet address
    const wallet = await this.transactionService['walletRepository'].findOne({
      where: { userId: req.user.id, isActive: true }
    });

    if (!wallet) {
      throw new Error('No active wallet found for user');
    }

    return await this.transactionService.getWalletBalance(wallet.address);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions (last 5)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent transactions retrieved successfully',
    type: [TransactionHistoryResponseDto] 
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecentTransactions(@Request() req): Promise<TransactionHistoryResponseDto[]> {
    return await this.transactionService.getTransactionHistory(req.user.id, 5, 1);
  }

  @Get('validate-address')
  @ApiOperation({ summary: 'Validate wallet address format' })
  @ApiResponse({ 
    status: 200, 
    description: 'Address validation result',
    schema: {
      type: 'object',
      properties: {
        address: { type: 'string' },
        isValid: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiQuery({ name: 'address', description: 'Wallet address to validate', example: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' })
  async validateAddress(@Query('address') address: string) {
    if (!address) {
      return {
        address: '',
        isValid: false,
        message: 'Address parameter is required'
      };
    }

    const cleanAddress = address.trim().toLowerCase();
    
    // Basic address format validation
    if (!cleanAddress.startsWith('0x') || cleanAddress.length !== 42) {
      return {
        address: cleanAddress,
        isValid: false,
        message: 'Invalid wallet address format - must start with 0x and be 42 characters long'
      };
    }

    // Check if address contains only valid hex characters
    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return {
        address: cleanAddress,
        isValid: false,
        message: 'Invalid wallet address characters - must contain only hex characters (0-9, a-f)'
      };
    }

    return {
      address: cleanAddress,
      isValid: true,
      message: 'Address format is valid'
    };
  }
} 