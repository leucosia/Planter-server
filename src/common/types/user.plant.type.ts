import { ApiProperty } from "@nestjs/swagger"

export class UserPlant {
    @ApiProperty({
        description: '유저 식물 ID'
    })
    user_plant_id: number

    @ApiProperty({
        description: '유저 ID'
    })
    user_id: number

    @ApiProperty({
        description: '식물 ID'
    })
    plant_id: number

    @ApiProperty({
        description: '현재 식물의 경험치'
    })
    exp: number

    @ApiProperty({
        description: '유저 식물 이름'
    })
    name: string | null

    @ApiProperty({
        description: '식물을 키우고 있는 여부'
    })
    plants_is_done: boolean

    @ApiProperty({
        description: '식물을 키우기 시작한 일'
    })
    start_date: Date

    @ApiProperty({
        description: '식물 키우기 완료 일'
    })
    end_date: Date
}