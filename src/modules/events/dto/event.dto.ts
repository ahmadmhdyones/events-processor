import { IsOptional, IsObject, IsString } from 'class-validator';

export class EventDto {
  @IsString()
  deviceId: string;

  @IsString()
  type: string;

  @IsString()
  timestamp: string;

  @IsObject()
  @IsOptional()
  details?: Record<string, any>; // Treat details as an arbitrary object
}
