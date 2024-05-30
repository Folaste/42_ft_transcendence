import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { SchoolStrategy } from './strategy/42Strategy';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { TwoFaCodeService } from 'src/twoFaCode/twoFaCode.service';
import { TwoFaCode } from 'src/entities/twoFaCode.entity';

@Module({
    controllers: [AuthController],
    imports: [
        TypeOrmModule.forFeature([User, TwoFaCode]),
        JwtModule.register({
            secret: `${process.env.SECRET}`
          }),
          HttpModule,
          UserModule,
    ],
    providers: [
        SchoolStrategy,
         {
        provide: 'AUTH_SERVICE', useClass: AuthService,
    },
    UserService,
    TwoFaCodeService
],
})
export class AuthModule {}
