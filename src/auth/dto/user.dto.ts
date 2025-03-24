import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { IsString, IsBoolean, MinLength, MaxLength, isString } from 'class-validator';


export class UserDto implements User {
    user_id: number;

    email: string;

    name: string;

    photo: string | null;

    createdAt: Date;

    updateAt: Date;
    
    refreshToken: string | null;

    platform: string;
}