import { ApiProperty } from "@nestjs/swagger";
import { plants, User, user_plants } from "@prisma/client";

export class AuthUserInfoResponse {
    @ApiProperty({
        description: "이메일 주소"
    })
    email: string

    @ApiProperty({
        description: "유저 이름 (현재 사용 X)"
    })
    name: string | null

    @ApiProperty({
        description: "유저 사진 (현재 사용 X)"
    })
    photo: string | null

    @ApiProperty({
        description: '계정 생성 일시'
    })
    createdAt: Date

    @ApiProperty({
        description: '업데이트 일시'
    })
    updateAt: Date

    @ApiProperty({
        description: 'refreshToken 값'
    })
    refreshToken: string

    @ApiProperty({
        description: '유저 ID'
    })
    user_id: number

    @ApiProperty({
        description: '회원가입 플랫폼 Google | Apple'
    })
    platform: string

    @ApiProperty({
        description: '현재 키우고 있는 유저의 식물 ID'
    })
    user_plant_id: number
}