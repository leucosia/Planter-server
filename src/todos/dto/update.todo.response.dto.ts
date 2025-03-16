import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class UpdateTodoResponseDto {
    @ApiProperty({
        description: "TODO ID"
    })
    @IsNumber()
    todo_id: number;

    @ApiProperty({
        description: "TODO 제목"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "TODO 설명"
    })
    @IsString()
    description: string | null;

    @ApiProperty({
        description: "TODO 시작일"
    })
    @IsDate()
    start_date: Date

    @ApiProperty({
        description: "TODO 마감일"
    })
    @IsDate()
    end_date: Date

    @ApiProperty({
        description: "유저 식물 ID"
    })
    @IsNumber()
    user_plants_id: number
    
    @ApiProperty({
        description: "해당 카테고리 아이디"
    })
    @IsNumber()
    user_category_id: number | null
}