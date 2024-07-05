import { Module } from '@nestjs/common';
import { ScrumpokerController } from './scrumpoker.controller';
import { EventsGateway } from './scrumpoker.gateway';
import { ScrumpokerService } from './scrumpoker.service';

@Module({
  controllers: [ScrumpokerController],
  providers: [EventsGateway, ScrumpokerService],
})
export class ScrumpokerModule {}
