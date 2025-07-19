import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WalletManagementService } from './wallet-management.service';
import { CreateWalletDto, ImportWalletDto, UpdateWalletDto, GenerateAddressesDto, RecoverWalletDto } from './dto/wallet.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@ApiTags('Wallet Management')
@Controller('wallet-management')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletManagementController {
  constructor(private readonly walletManagementService: WalletManagementService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new wallet with seed phrase' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wallet created successfully with seed phrase'
  })
  async createWallet(
    @Body() createWalletDto: CreateWalletDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.createWallet(
      req.user.userId,
      createWalletDto,
    );
    return ApiResponseDto.success('Wallet created successfully. Please save your seed phrase securely!', wallet);
  }

  @Post('import/mnemonic')
  @ApiOperation({ summary: 'Import wallet from seed phrase' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wallet imported successfully with seed phrase'
  })
  async importFromMnemonic(
    @Body() importWalletDto: ImportWalletDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.importFromMnemonic(
      req.user.userId,
      importWalletDto,
    );
    return ApiResponseDto.success('Wallet imported successfully with seed phrase. You can now generate additional addresses.', wallet);
  }

  @Post('import/private-key')
  @ApiOperation({ summary: 'Import wallet address from private key' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wallet address imported successfully'
  })
  async importFromPrivateKey(
    @Body() importWalletDto: ImportWalletDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.importFromPrivateKey(
      req.user.userId,
      importWalletDto,
    );
    return ApiResponseDto.success('Wallet address imported successfully. Note: This wallet cannot generate additional addresses.', wallet);
  }

  @Get('my-wallet')
  @ApiOperation({ summary: 'Get user wallet (only one wallet per user)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet retrieved successfully'
  })
  async getMyWallet(@Request() req): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.getUserWallets(req.user.userId);
    if (!wallet) {
      return ApiResponseDto.success('No wallet found. Create your first wallet!', null);
    }
    return ApiResponseDto.success('Wallet retrieved successfully', wallet);
  }

  @Get('main-wallet')
  @ApiOperation({ summary: 'Get user main wallet (only one wallet per user)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Main wallet retrieved successfully'
  })
  async getMainWallet(@Request() req): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.getMainWallet(req.user.userId);
    return ApiResponseDto.success('Main wallet retrieved successfully', wallet);
  }

  @Put('wallet/update')
  @ApiOperation({ summary: 'Update wallet label by address' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet updated successfully'
  })
  async updateWallet(
    @Body() updateWalletDto: UpdateWalletDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const wallet = await this.walletManagementService.updateWalletByAddress(
      req.user.userId,
      updateWalletDto,
    );
    return ApiResponseDto.success('Wallet label updated successfully', wallet);
  }

  @Post('generate-addresses')
  @ApiOperation({ summary: 'Generate additional addresses from user seed phrase' })
  @ApiResponse({ 
    status: 201, 
    description: 'Additional addresses generated successfully'
  })
  async generateAdditionalAddresses(
    @Request() req,
  ): Promise<ApiResponseDto> {
    const addresses = await this.walletManagementService.generateAdditionalAddresses(
      req.user.userId,
    );
    return ApiResponseDto.success('Additional addresses generated successfully', addresses);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'Get all addresses from user seed phrase with private keys' })
  @ApiResponse({ 
    status: 200, 
    description: 'Addresses retrieved successfully'
  })
  async getAddressesFromSeedPhrase(
    @Request() req,
  ): Promise<ApiResponseDto> {
    const addresses = await this.walletManagementService.getAddressesFromSeedPhrase(
      req.user.userId,
    );
    return ApiResponseDto.success('Addresses retrieved successfully', addresses);
  }

  @Delete('wallet/:id')
  @ApiOperation({ summary: 'Delete wallet' })
  @ApiParam({ name: 'id', description: 'Wallet ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Wallet deleted successfully'
  })
  async deleteWallet(
    @Param('id') id: string,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const walletId = this.validateWalletId(id);
    await this.walletManagementService.deleteWallet(walletId, req.user.userId);
    return ApiResponseDto.success('Wallet deleted successfully');
  }

  /**
   * Validate wallet ID parameter
   */
  private validateWalletId(id: string): number {
    // Check if the ID is a valid integer
    if (!/^\d+$/.test(id)) {
      throw new BadRequestException('Invalid wallet ID. Must be a positive integer.');
    }
    
    const walletId = parseInt(id, 10);
    
    // Check if the number is within safe integer range
    if (walletId > Number.MAX_SAFE_INTEGER) {
      throw new BadRequestException('Wallet ID is too large. Please use a valid wallet ID.');
    }
    
    if (walletId <= 0) {
      throw new BadRequestException('Wallet ID must be a positive integer.');
    }
    
    return walletId;
  }

  @Post('recover')
  @ApiOperation({ summary: 'Recover wallet using email and password' })
  @ApiResponse({ 
    status: 201, 
    description: 'Wallet recovered successfully with all addresses'
  })
  async recoverWallet(
    @Body() recoverWalletDto: RecoverWalletDto,
    @Request() req,
  ): Promise<ApiResponseDto> {
    const result = await this.walletManagementService.recoverWallet(
      req.user.userId,
      recoverWalletDto,
    );
    return ApiResponseDto.success('Wallet recovered successfully with all addresses', result);
  }
} 