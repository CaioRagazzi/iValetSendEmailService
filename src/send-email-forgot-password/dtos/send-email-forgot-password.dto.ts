import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SendEmailForgotPasswordDto {
    @IsNotEmpty()
    @IsString()
    to: string;
}