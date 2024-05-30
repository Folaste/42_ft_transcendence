import {IsNotEmpty, IsNumber} from "class-validator";

export class CreatePendingInvitationDto {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    chatroomId: number;
}