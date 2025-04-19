import { ApiProperty } from "@nestjs/swagger";

export class CompletedTodo {
    @ApiProperty({
        description: 'TODO 해당일 id'
    })
    completed_todo_id: number

    @ApiProperty({
        description: 'TODO 해당일 완료 여부'
    })
    is_done: boolean

    @ApiProperty({
        description: 'TODO 해당일'
    })
    complete_at: Date

    @ApiProperty({
        description: 'TODO ID'
    })
    todo_id: number
}