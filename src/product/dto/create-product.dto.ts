import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsStrongPassword, Length, IsString, IsNumber, IsBoolean } from "class-validator";

export class CreateProductDto {
    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    sku: string;
    
    @ApiProperty()
    @IsBoolean()
    isoutofstock: boolean;

}




