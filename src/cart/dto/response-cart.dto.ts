import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";

export class ResponseCartDTO{

    @ApiProperty()
    @IsUUID()
    id: string;

    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty()
     @IsUUID()
     productId: string;

     @ApiProperty()
     @IsNumber()
     quantity: number;
}