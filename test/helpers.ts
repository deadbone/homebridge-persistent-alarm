import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { vi } from 'vitest';
import type { NormalizedAlarmConfig, NormalizedPlatformConfig } from '../src/config/types.js';
import type { Clock } from '../src/services/clock.js';

export const sampleAlarm: NormalizedAlarmConfig = {
  id: 'washing-machine',
  name: 'Washing Machine Reminder',
  delaySeconds: 60,
  motionDurationSeconds: 10,
  repeatMode: 'once',
  repeatCount: 1,
  homekitExposure: {
    cancelSwitch: true,
  },
};

export const sampleConfig: NormalizedPlatformConfig = {
  platform: 'PersistentAlarm',
  name: 'Persistent Alarm',
  debug: false,
  alarms: [sampleAlarm],
};

export class ManualClock implements Clock {
  public constructor(private current: Date = new Date('2026-07-21T08:00:00.000Z')) {}

  public now(): Date {
    return new Date(this.current);
  }

  public set(value: string): void {
    this.current = new Date(value);
  }

  public advance(seconds: number): void {
    this.current = new Date(this.current.getTime() + seconds * 1000);
  }
}

export function temporaryDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'persistent-alarm-test-'));
}

export function createLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}
