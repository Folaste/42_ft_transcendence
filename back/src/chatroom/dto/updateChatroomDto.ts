import { IsString, IsOptional } from "class-validator";

export class UpdateChatroomDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    hashed_pwd?: string;

    @IsOptional()
    @IsString()
    type?: string;
}