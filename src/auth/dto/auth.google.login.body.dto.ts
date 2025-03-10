import { ApiProperty } from "@nestjs/swagger";

export class AuthGoogleLoginBody {
    @ApiProperty({
        description: "구글 로그인 토큰"
    })
    token: string;
}