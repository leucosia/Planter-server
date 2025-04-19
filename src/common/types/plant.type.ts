import { ApiProperty } from "@nestjs/swagger";

export class Plant {
    @ApiProperty({
        description: '식물 ID'
    })
    plant_id: number

    @ApiProperty({
        description: '레벨업 후 다음 식물의 ID'
    })
    next_plant_id: number

    @ApiProperty({
        description: '해당 식물의 이미지 주소'
    })
    image: string

    @ApiProperty({
        description: '레벨업까지 필요한 경험치'
    })
    max_exp: number
}