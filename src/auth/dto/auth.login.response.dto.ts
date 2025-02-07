import { ApiProperty } from "@nestjs/swagger";


export class AuthLoginResponse {
    @ApiProperty({ description: '로그인 응답으로 제공되는 access token입니다.'})
    accessToken: string;
}