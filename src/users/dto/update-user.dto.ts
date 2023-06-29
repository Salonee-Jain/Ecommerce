import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto){
    

    @ApiProperty()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsEmail() 
    @IsString()
    email?: string;

    @IsStrongPassword()
    @IsString()
    @ApiProperty()
    password?: string;
}
