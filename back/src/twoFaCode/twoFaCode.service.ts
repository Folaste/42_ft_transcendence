import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {TwoFaCode} from "../entities/twoFaCode.entity";
import {Repository} from "typeorm";
import {CreateTwoFaCodeDto, UpdateTwoFaCodeDto} from "./dto/createTwoFaCodeDto";
import {UserService} from "../user/user.service";


@Injectable()
export class TwoFaCodeService {

    constructor(
        @InjectRepository(TwoFaCode) private readonly twoFaCodeRepo: Repository<TwoFaCode>,
        private readonly userService: UserService
    ) {}

    async create(createTwoFaCodeDto: CreateTwoFaCodeDto) {
        const { code, user_id} = createTwoFaCodeDto;
        const [ user ] = await Promise.all([
            this.userService.findUserById(user_id)
        ]);

        if (!user) {
            throw new NotFoundException(`User with ID ${user_id} not found.`);
        }

        const two_fa_code = new TwoFaCode();
        two_fa_code.code = code;
        two_fa_code.user = user;

        return await this.twoFaCodeRepo.save(two_fa_code);
    }

    async delete(id: number) {
        return await this.twoFaCodeRepo.delete({user: {id:id}});
    }

    async update(id: number, updateTwoFaCodeDto: UpdateTwoFaCodeDto) {
        return await this.twoFaCodeRepo.update({user: {id:id}}, updateTwoFaCodeDto);
    }

    async getTwoFaCodeByUserId(id:number)
    {
        return await this.twoFaCodeRepo.findOneBy({user:{id:id}});
    }
}