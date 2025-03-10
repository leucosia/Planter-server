import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class AuthUserInfoResponse {
    @ApiProperty({
        description: "검증된 유저 정보 반환"
    })
    user: User
}