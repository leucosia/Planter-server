import { ApiProperty } from "@nestjs/swagger";
import { IsUrl, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class AuthSignupBody {
    @ApiProperty({
        description: "이메일 주소",
        required: false,
        example: "ykm989@naver.com"
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: "사용자 이름",
        required: false,
        example: '김경호'
    })
    @IsString()
    @MaxLength(30)
    name: string;
    
    @ApiProperty({
        description: "프로필 사진 URL",
        required: false,
        example: 'https://image.url/here/optional',
    })
    @IsUrl()
    imageUrl?: string;
}