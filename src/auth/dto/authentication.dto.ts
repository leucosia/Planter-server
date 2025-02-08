import { IsEmail } from "class-validator";

export class Authentication {
    @IsEmail()
    email: string;
}