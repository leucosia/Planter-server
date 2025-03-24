import { ApiProperty } from "@nestjs/swagger";

export class AuthRefreshTokenBody {
    @ApiProperty({
        description: "Token 갱신을 위한 Refresh Token"
    })
    refreshToken: string
}