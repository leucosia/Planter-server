import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";

export class CreateTodoBodyDto {
    @ApiProperty({
        description: "TODO 제목"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "TODO 상세 설명"
    })
    description: string | null;
    
    @ApiProperty({
        description: "카테고리 Number"
    })
    @IsNumber()
    user_category_id: number;

    @ApiProperty({
        description: "현재 식물 ID"
    })
    @IsNumber()
    user_plants_id: number
    
    @ApiProperty({
        description: "TODO 시작일"
    })
    start_date: Date
    
    @ApiProperty({
        description: "TODO 마감일"
    })
    end_date: Date
}