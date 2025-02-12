import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class AuthGoogleLoginBody {
    @ApiProperty({
        description: "구글 로그인 토큰"
    })
    idToken: string;
}