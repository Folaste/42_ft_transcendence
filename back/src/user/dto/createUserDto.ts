import {IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateUserDto
{
    @IsString()
    login42: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsEmail()
    @IsNotEmpty()
    email:string;
}

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    nickname: string;


    @IsOptional()
    @IsString()
    avatarURI: string;

    @IsOptional()
    @IsEmail()
    @IsNotEmpty()
    email:string;

    @IsOptional()
    @IsBoolean()
    auth2F:boolean
}