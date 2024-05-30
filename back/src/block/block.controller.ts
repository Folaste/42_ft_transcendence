import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {BlockService} from "./block.service";
import {CreateBlockDto} from "./dto/createBlockDto";

@Controller("block")
export class BlockController {

    constructor(private readonly blockService: BlockService) {}

    @Post()
    create(@Body() createBlockDto: CreateBlockDto) {
        return this.blockService.create(createBlockDto);
    }

    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.blockService.delete(id);
    }

    @Delete("/deleteFromUsers/:blockingUser/:blockedUser")
    deleteFromUsers(@Param("blockingUser") blockingUser: number, @Param("blockedUser") blockedUser: number) {
        return this.blockService.deleteFromUsers(blockingUser, blockedUser);
    }

    @Get("/allUsersBlocked/:id")
    getAllUserBlocked(@Param("id") id:number)
    {
        return this.blockService.getAllUsersBlocked(id);
    }
}