import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventDto } from './dto/event.dto';
import { EventTypes } from './enums/event-types.enum';
import { Event, EventStore } from './mocks/event.mock';
import { getEnumKeyByEnumValue } from 'src/utils';
import { EventNames } from './enums/event-names.enum';

@Injectable()
export class EventsService {
  constructor(
    private httpService: HttpService,
    private eventEmitter: EventEmitter2,
  ) {}

  private emitEvent(evt: Event): boolean {
    const eventKey =
      getEnumKeyByEnumValue(EventTypes, evt.type) || 'UnsupportedEvent';
    const eventName = EventNames[eventKey];
    return this.eventEmitter.emit(eventName, evt);
  }

  addEvent(evt: EventDto): Event {
    EventStore.push({
      eventId: String(EventStore.length + 1),
      ...(evt as Event),
    });
    return EventStore[EventStore.length - 1];
  }

  getEvents(): Event[] {
    return EventStore;
  }

  processEvent(evt: Event): any {
    this.emitEvent(evt);
    // Additional handling like logging, notifications, etc.
  }

  async sendNotification(notificationData: any): Promise<any> {
    const url = 'http://localhost:3000/v1/notify';
    try {
      const response = await this.httpService
        .post(url, notificationData)
        .toPromise();
      return response.data;
    } catch (error) {
      throw new Error('Error sending notification');
    }
  }
}
