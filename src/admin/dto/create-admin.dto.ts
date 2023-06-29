

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNotEmpty, IsEmail, Matches, IsAlphanumeric, IsStrongPassword } from 'class-validator';

export class CreateAdminDto {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail() 
  email: string;

  @ApiProperty()
  @IsStrongPassword()
  @Length(6)
  @IsNotEmpty()
  password: string;
  
  @ApiProperty()
  @IsNotEmpty()
  confirm_password: string;
}

  