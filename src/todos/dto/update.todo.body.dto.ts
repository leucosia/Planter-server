import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class UpdateTodoBodyDto {
    @ApiProperty({
        description: "TODO 수정 제목, 수정 없을 시 기존 내용 작성"
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: "TODO 상세 설명, 수정 없을 시 기존 내용 작성"
    })
    description: string | null;
    
    @ApiProperty({
        description: "카테고리 ID, 수정 없을 시 기존 내용 작성"
    })
    @IsNumber()
    userCategoryId: number;
    
    @ApiProperty({
        description: "TODO 시작일, 수정 없을 시 기존 내용 작성"
    })
    startDate: Date
    
    @ApiProperty({
        description: "TODO 마감일, 수정 없을 시 기존 내용 작성"
    })
    endDate: Date
}