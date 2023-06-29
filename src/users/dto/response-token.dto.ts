import { ApiProperty } from "@nestjs/swagger";

export class ResponseTokenDTO{
    @ApiProperty()
    userId: string

    @ApiProperty()
    token: string;
}