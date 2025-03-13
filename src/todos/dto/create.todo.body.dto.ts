import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateTodoBodyDto {
    @ApiProperty({
        description: "TODO 제목"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "TODO 상세 설명",
        example: ""
    })
    description: string | null;
    
    @ApiProperty({
        description: "카테고리 Number"
    })
    @IsNumber()
    userCategoryId: number;

    @ApiProperty({
        description: "현재 식물 ID"
    })
    @IsNumber()
    userPlantsId: number;
    
    @ApiProperty({
        description: "TODO 시작일",
        format: "date"
    })
    startDate: Date;
    
    @ApiProperty({
        description: "TODO 마감일",
        format: "date"
    })
    endDate: Date;
}