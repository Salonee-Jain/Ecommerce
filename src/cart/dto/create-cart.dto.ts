import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateCartDto {
      
    @ApiProperty()
        @IsNotEmpty()
         @IsUUID()
         productId: string;

         @ApiProperty()
         @IsNotEmpty()
         @IsNumber()
         quantity: number;
}
