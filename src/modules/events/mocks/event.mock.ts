export interface Event {
  eventId: string;
  deviceId: string;
  type: string;
  timestamp: string;
  details: any;
}

export interface ProgramEvent extends Omit<Event, 'details'> {
  details: {
    programId: string;
  };
}

export const EventStore: Event[] = []; // In-memory store for events
