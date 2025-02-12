import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";

export class AuthLoginBody implements User {
    id: number;

    @ApiProperty({
        description: "이메일",
        example: "planter@naver.com"
    })
    email: string;

    name: string;

    photo: string | null;

    createdAt: Date;

    updateAt: Date;

    refreshToken: string | null;
}