import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty } from "class-validator";

export class AuthSignupResponse {
    @ApiProperty({
        description: "회원가입 응답으로 제공되는 access token 입니다.",
    })
    @IsJWT()
    @IsNotEmpty()
    accessToken: string;
}