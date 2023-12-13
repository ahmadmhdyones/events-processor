import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationModule } from './modules/notification/notification.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [
    NotificationModule,
    EventsModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
