import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString } from "class-validator";

export class CreateTodoResponseDTO {
    @ApiProperty({
        description: "TODO ID"
    })
    @IsNumber()
    todoId: number;

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
    startDate: Date

    @ApiProperty({
        description: "TODO 마감일"
    })
    @IsDate()
    endDate: Date
    
    @ApiProperty({
        description: "해당 TODO 완료 여부"
    })
    @IsBoolean()
    isDone: Boolean

    @ApiProperty({
        description: "유저 식물 ID"
    })
    @IsNumber()
    userPlantsId: number
    
    @ApiProperty({
        description: "해당 카테고리 아이디"
    })
    @IsNumber()
    userCategoryId: number
}