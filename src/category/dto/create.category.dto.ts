import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({
        description: "설정할 색상"
    })
    @IsString()
    color: string
}
