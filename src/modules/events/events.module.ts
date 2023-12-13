import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsListeners } from './events.listeners';
import { UserProgressService } from './mocks/user-progress.mock';

@Module({
  imports: [HttpModule],
  providers: [EventsService, EventsListeners, UserProgressService],
  controllers: [EventsController],
})
export class EventsModule {}
