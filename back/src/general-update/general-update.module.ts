import { Module } from '@nestjs/common';
import { GeneralUpdateGateway } from './general-update.gateway';
import { GeneralUpdateService } from './general-update.service';

@Module({
  providers: [GeneralUpdateGateway, GeneralUpdateService]
})
export class GeneralUpdateModule {}
