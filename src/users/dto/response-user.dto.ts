
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNotEmpty, IsEmail, Matches, IsAlphanumeric, IsStrongPassword, IsUUID, IsIn } from 'class-validator';

export class ResponseUserDto {

@ApiProperty()
@IsNotEmpty()
@IsUUID()
  userId: string;

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
  @IsNotEmpty()
  roleId: number ;

}

  