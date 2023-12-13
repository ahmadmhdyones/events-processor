import { ProgramEvent } from './event.mock';
import { EventTypes } from '../enums/event-types.enum';
import { Injectable } from '@nestjs/common';

export interface UserProgress {
  activityId: string;
  deviceId: string;
  programId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'completed' | 'in-progress' | 'cancelled';
}

export class UserProgressStore {
  private static instance: UserProgressStore;
  private userProgresses: UserProgress[] = [];

  private constructor() {}

  static getInstance(): UserProgressStore {
    if (!UserProgressStore.instance) {
      UserProgressStore.instance = new UserProgressStore();
    }
    return UserProgressStore.instance;
  }

  addUserProgress(progress: UserProgress) {
    this.userProgresses.push(progress);
  }

  getUserProgresses(): UserProgress[] {
    return this.userProgresses;
  }

  updateUserProgressByIndex(index: number, obj: any) {
    this.userProgresses[index] = { ...this.userProgresses[index], ...obj };
  }
}

@Injectable()
export class UserProgressService {
  private store = UserProgressStore.getInstance();

  addUpdateUserProgress(evt: ProgramEvent): void {
    switch (evt.type) {
      case EventTypes.TrainingProgramStarted:
        this.store.addUserProgress({
          activityId: String(UserProgressStore.length + 1),
          deviceId: evt.deviceId,
          programId: evt.details.programId,
          startTime: evt.timestamp,
          endTime: null,
          duration: null,
          status: 'in-progress',
        });
        break;
      case EventTypes.TrainingProgramFinished:
      case EventTypes.TrainingProgramCancelled:
        const index = this.findItemIndexByIds(
          evt.deviceId,
          evt.details.programId,
        );
        this.setEndTimeByIndex(index, evt.timestamp);
        this.setStatusByIndex(index, evt.type);
        break;
    }
  }

  getUserProgress(): UserProgress[] {
    return this.store.getUserProgresses();
  }

  getItemByIds(deviceId: string, programId: string): UserProgress {
    return this.store.getUserProgresses()[
      this.findItemIndexByIds(deviceId, programId)
    ];
  }

  getItemByIndex(index: number): UserProgress {
    return this.store.getUserProgresses()[index];
  }

  private findItemIndexByIds(deviceId: string, programId: string): number {
    return this.store
      .getUserProgresses()
      .findIndex(
        (obj) => obj.deviceId === deviceId && obj.programId === programId,
      );
  }

  private setEndTimeByIndex(index: number, time: string): void {
    const { startTime } = this.getItemByIndex(index);
    const diff = (Number(new Date(time)) - Number(new Date(startTime))) / 60000;
    this.store.updateUserProgressByIndex(index, {
      endTime: time,
      duration: diff,
    });
  }

  private setStatusByIndex(index: number, type: EventTypes): void {
    const status =
      type === EventTypes.TrainingProgramFinished ? 'completed' : 'cancelled';
    this.store.updateUserProgressByIndex(index, { status });
  }

  // Other methods for user progress...
}
