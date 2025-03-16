import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString } from "class-validator";

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
    user_category_id: number | null;
    
    @ApiProperty({
        description: "TODO 시작일, 수정 없을 시 기존 내용 작성"
    })
    @IsDateString()
    start_date: string;
    
    @ApiProperty({
        description: "TODO 마감일, 수정 없을 시 기존 내용 작성"
    })
    @IsDateString()
    end_date: string;
}