import { ApiProperty } from "@nestjs/swagger";

export class Category {
    @ApiProperty({
        description: 'Category ID'
    })
    user_category_id: number

    @ApiProperty({
        description: '유저 ID'
    })
    user_id: number

    @ApiProperty({
        description: '카테고리 색상',
        example: '#FFFFFF'
    })
    color: string
}