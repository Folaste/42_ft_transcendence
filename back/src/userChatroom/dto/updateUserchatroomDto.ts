import {IsBoolean, IsDateString, IsOptional} from "class-validator";

export class UpdateUserchatroomDto {
    @IsOptional()
    @IsBoolean()
    is_owner?: boolean;

    @IsOptional()
    @IsBoolean()
    is_admin?: boolean;

    @IsOptional()
    @IsBoolean()
    is_muted?: boolean;

    @IsOptional()
    @IsBoolean()
    is_banned?: boolean;

    @IsOptional()
    @IsDateString()
    muted_timer: Date;
}