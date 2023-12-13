import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventNames } from './enums/event-names.enum';
import { Event, ProgramEvent } from './mocks/event.mock';
import { EventsService } from './events.service';
import { UserProgressService } from './mocks/user-progress.mock';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class EventsListeners {
  private readonly logger = new Logger(EventsListeners.name);
  private readonly CHECK_TIME_DELAY = 600000; // 10 minutes in milliseconds

  constructor(
    private eventService: EventsService,
    private schedulerRegistry: SchedulerRegistry,
    private userProgressService: UserProgressService,
  ) {}

  private async sendStartTrainingNotification(evt: Event): Promise<any> {
    try {
      const notification = await this.eventService.sendNotification({
        deviceId: evt.deviceId,
        msg: `Start Training Now!`,
      });
      this.logger.log(notification);
    } catch (error) {
      this.logger.error(
        `Error sending start training notification: ${error.message}`,
      );
    }
  }

  private cancelStartTrainingNotification(deviceId: string): void {
    const id = `${EventNames.AppLaunched}-${deviceId}`;
    const timeout = this.schedulerRegistry.getTimeout(id);
    if (timeout) {
      clearTimeout(timeout);
      this.schedulerRegistry.deleteTimeout(id);
      this.logger.log(
        `Cancelled start training notification task for device: ${deviceId}`,
      );
    }
  }

  private isTrainingDurationSufficient(evt: ProgramEvent): boolean {
    const MIN_PROGRAM_DURATION: number = 30;
    const programProgress = this.userProgressService.getItemByIds(
      evt.deviceId,
      evt.details.programId,
    );
    return programProgress.duration > MIN_PROGRAM_DURATION;
  }

  private async sendCongratulatoryNotification(
    evt: ProgramEvent,
  ): Promise<void> {
    const programProgress = this.userProgressService.getItemByIds(
      evt.deviceId,
      evt.details.programId,
    );
    const notification = await this.eventService.sendNotification({
      deviceId: evt.deviceId,
      msg: `Congrats, you have spent ${programProgress.duration}min training on this program ${evt.details.programId}.`,
    });
    this.logger.log(notification);
  }

  @OnEvent(EventNames.AppLaunched)
  handleAppLaunch(evt: Event): void {
    const timeout = setTimeout(
      async () => await this.sendStartTrainingNotification(evt),
      this.CHECK_TIME_DELAY,
    );

    // Store the timeout reference to manage it later (e.g., to clear it)
    const timeoutId = `${EventNames.AppLaunched}-${evt.deviceId}`;
    this.schedulerRegistry.addTimeout(timeoutId, timeout);
  }

  @OnEvent(EventNames.TrainingProgramStarted)
  handleTrainingProgramStarted(evt: ProgramEvent): void {
    this.cancelStartTrainingNotification(evt.deviceId);

    // Additional handling...
  }

  @OnEvent(EventNames.TrainingProgramFinished)
  async handleTrainingProgramFinished(evt: ProgramEvent): Promise<void> {
    try {
      if (this.isTrainingDurationSufficient(evt)) {
        await this.sendCongratulatoryNotification(evt);
      }
    } catch (error) {
      this.logger.error(
        `Error in handling TrainingProgramFinished: ${error.message}`,
      );
    }
  }

  @OnEvent(EventNames.UnsupportedEvent)
  handleUnsupportedEvent(evt: Event): void {
    this.logger.warn(`Received unsupported event type: ${evt.type}`);
  }

  @OnEvent('*')
  handleGenericEvent(evt: Event): void {
    this.logger.log(evt);
  }

  // More event listener methods as needed...
}
