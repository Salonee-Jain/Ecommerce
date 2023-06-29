
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, IsNotEmpty, IsEmail, Matches, IsAlphanumeric, IsStrongPassword } from 'class-validator';
export class LoginUserDto{
   
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail() 
  email: string;

  @ApiProperty()
  @Length(6)
  @IsNotEmpty()
  password: string;
 }
 