import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
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



