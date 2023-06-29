import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsNumber()
    price?: number;

    @ApiProperty()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsString()
    sku?: string;
    
    @ApiProperty()
    @IsBoolean()
    isoutofstock?: boolean;
  
}