import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { EventDto } from './dto/event.dto';
import { UserProgressService } from './mocks/user-progress.mock';

@Controller()
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private userProgress: UserProgressService,
  ) {}

  @Post('event')
  @Version('1')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async handleEvent(@Body() payload: EventDto) {
    const event = this.eventsService.addEvent(payload);

    // ? mock data from event
    this.userProgress.addUpdateUserProgress(event);
    // ! this is aside code, shouldn't be here!

    const result = await this.eventsService.processEvent(event);

    return {
      status: 'ok',
      data: { event },
      details: { ...result },
    };
  }
}
