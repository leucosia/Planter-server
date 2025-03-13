import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { IsString, IsBoolean, MinLength, MaxLength, isString } from 'class-validator';


export class UserDto implements User {
    userId: number;

    email: string;

    name: string;

    photo: string | null;

    createdAt: Date;

    updateAt: Date;
    
    refreshToken: string | null;
}