import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateChatroomDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    hashed_pwd?: string;

    @IsNotEmpty()
    @IsString()
    type: string;

    @IsOptional()
    @IsNumber()
    userId_1?: number;

    @IsOptional()
    @IsNumber()
    userId_2?: number;
}