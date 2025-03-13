import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AuthAccessTokenBody {
    @ApiProperty({
        description: "Access Token 검증을 위한 API"
    })
    @IsString()
    accessToken: string
}