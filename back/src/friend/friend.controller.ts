import {Body, Controller, Delete, Get, Param, Post, Request, UnauthorizedException, UseGuards} from "@nestjs/common";
import {CreateFriendDto, DeleteFriendDto} from "./dto/createFriendDto";
import {FriendService} from "./friend.service";
import { JwtGuard } from "src/auth/guards/JwtGuards";
import { UserService } from "src/user/user.service";

@Controller("friend")
export class FriendController {

    constructor(private readonly friendService: FriendService,
    private readonly userService:UserService,
    ) {}

    @Post()
    create(@Body() createFriendDto: CreateFriendDto) {
        return this.friendService.create(createFriendDto);
    }

    @Delete(":id")
    delete(@Param("id") id: number) {
        return this.friendService.delete(id);
    }

    @UseGuards(JwtGuard)
    @Get("/allFriends/:userId")
    async findAllUsersButUserIdAndFriends(@Param("userId") userId:number, @Request() req)
    {   
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        return this.friendService.getAllFriends(userId);
    }

    @UseGuards(JwtGuard)
    @Post('/deleteOneFriend')
    async deleteOneFriend(@Body() deleteFriendDto: DeleteFriendDto, @Request() req)
    {
        const user = await this.userService.findUserByUsername(req.user.login42);
        if (!user)
            throw new UnauthorizedException();
        return this.friendService.deleteOneFriend(deleteFriendDto);
    }
}