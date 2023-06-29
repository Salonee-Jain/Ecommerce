import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsEmail, IsInt, Min, Max, IsNotEmpty, IsIn } from 'class-validator';

export class CreateUserDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsUUID()
  // userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  confirm_password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  roleId: number;

}

