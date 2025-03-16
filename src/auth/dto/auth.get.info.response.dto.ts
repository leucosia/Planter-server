import { ApiProperty } from "@nestjs/swagger";
import { plants, User, user_plants } from "@prisma/client";
import { Planter } from "src/planter/entities/planter.entity";

export class AuthUserInfoResponse {
    @ApiProperty({
        description: "검증된 유저 정보 반환"
    })
    user: User

    @ApiProperty({
        description: "유저의 현재 식물 정보"
    })
    userPlant: user_plants

    @ApiProperty({
        description: "식물 정보"
    })
    plant: plants
}