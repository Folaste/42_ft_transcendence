import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    @IsNotEmpty()
    authorId: number;

    @IsNumber()
    @IsNotEmpty()
    chatroomId: number;
}