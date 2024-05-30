import {IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateUserchatroomDto {

    @IsBoolean()
    isOwner: boolean;

    @IsBoolean()
    isAdmin: boolean;

    @IsBoolean()
    isMuted: boolean;

    @IsBoolean()
    isBanned: boolean;

    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    chatroomId: number;

    @IsOptional()
    @IsString()
    password: string

    @IsOptional()
    @IsNumber()
    invitationId: number
}