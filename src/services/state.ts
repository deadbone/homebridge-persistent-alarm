import type { RepeatMode } from '../config/types.js';

export interface AlarmPersistentState {
  triggerAt: string | null;
  sensorActiveUntil: string | null;
  scheduleDelaySeconds: number | null;
  repeatMode: RepeatMode;
  repeatCount: number;
  completedTriggers: number;
}

export interface PersistentStateFile {
  schemaVersion: 1;
  alarms: Record<string, AlarmPersistentState>;
}

export function emptyAlarmState(): AlarmPersistentState {
  return {
    triggerAt: null,
    sensorActiveUntil: null,
    scheduleDelaySeconds: null,
    repeatMode: 'once',
    repeatCount: 1,
    completedTriggers: 0,
  };
}
