import { ApiProperty } from "@nestjs/swagger";

export class Todo {
    @ApiProperty({
        description: 'TODO ID'
    })
    todo_id: number

    @ApiProperty({
        description: 'TODO 제목'
    })
    title: string

    @ApiProperty({
        description: 'TODO 생성일'
    })
    start_date: Date

    @ApiProperty({
        description: 'TODO 마감일'
    })
    end_date: Date

    @ApiProperty({
        description: '해당 TODO 유저의 ID'
    })
    user_id: number

    @ApiProperty({
        description: '해당 TODO가 성장에 영향을 주는 식물 ID'
    })
    user_plant_id: number

    @ApiProperty({
        description: 'TODO가 소속된 Category'
    })
    user_category_id: number | null
}