import {Body, Controller, Delete, Get, Param, Post, Put} from "@nestjs/common";
import {CreateTwoFaCodeDto, UpdateTwoFaCodeDto} from "./dto/createTwoFaCodeDto";
import {TwoFaCodeService} from "./twoFaCode.service";

@Controller("twoFaCode")
export class TwoFaCodeController {

    constructor(private readonly twoFaCodeService: TwoFaCodeService) {}

    @Post()
    create(@Body() createTwoFaCodeDto: CreateTwoFaCodeDto) {
        return this.twoFaCodeService.create(createTwoFaCodeDto);
    }

    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.twoFaCodeService.delete(id);
    }

    @Put(":id")
    update(@Param("id") id:number, @Body() updateTwoFaCodeDto: UpdateTwoFaCodeDto)
    {
        return this.twoFaCodeService.update(id, updateTwoFaCodeDto);
    }

    @Get(":id")
    getTwoFaCodeByUser(@Param("id") id:number)
    {
        return this.twoFaCodeService.getTwoFaCodeByUserId(id);
    }
}