import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ 
    description: 'User full name (optional)',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'User password (minimum 6 characters)',
    example: 'password123'
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'User phone number (optional)',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'User address (optional)',
    example: '123 Main St, City, Country',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;
} 