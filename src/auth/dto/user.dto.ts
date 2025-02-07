import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { IsString, IsBoolean, MinLength, MaxLength, isString } from 'class-validator';


export class UserDto implements User {
    id: number;

    email: string;

    name: string;

    createdAt: Date;

    updateAt: Date;
    
}