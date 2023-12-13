import { Body, Controller, Post, Version } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('notify')
  @Version('1')
  sendNotification(@Body() payload: any): string {
    return this.notificationService.sendNotification(payload);
  }
}
