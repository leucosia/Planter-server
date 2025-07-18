import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateTodoBodyDto {
    // --------------필수--------------
    @ApiProperty({
        description: "TODO 제목"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "현재 식물 ID"
    })
    @IsNumber()
    user_plant_id: number;

    // --------------옵셔널--------------
    @ApiProperty({
        description: "카테고리 Number"
    })
    @IsOptional()
    @IsNumber()
    user_category_id: number | null;

    @ApiProperty({
        description: "TODO 상세 설명",
        example: ""
    })
    @IsOptional()
    description: string | null;

    @ApiProperty({
        description: "TODO 시작일",
        format: "date"
    })
    @IsOptional()
    start_date: Date | null;
    
    @ApiProperty({
        description: "TODO 마감일",
        format: "date"
    })
    @IsOptional()
    end_date: Date | null;
}