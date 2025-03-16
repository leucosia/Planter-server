import { ApiProperty } from "@nestjs/swagger";
import { plants, User, user_plants } from "@prisma/client";

export class AuthUserInfoResponse {
    @ApiProperty({
        description: "유저 정보"
    })
    user: User

    @ApiProperty({
        description: "유저의 현재 식물 정보"
    })
    userPlant: user_plants

    @ApiProperty({
        description: "현재 유저가 키우고 있는 식물의 기본 정보"
    })
    plant: plants
}