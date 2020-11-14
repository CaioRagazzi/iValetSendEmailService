import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendEmailForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    to: string;

    @IsNotEmpty()
    @IsString()
    subject: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    userName: string;
}