import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  sendNotification(payload: { deviceId: string; msg: string }): any {
    return {
      message: payload.msg,
      from: 'Notification Service',
      to: payload.deviceId,
    };
  }
}
