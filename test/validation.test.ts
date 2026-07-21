import { describe, expect, it } from 'vitest';
import { ConfigValidationError, normalizeConfig } from '../src/config/validation.js';

describe('configuration validation', () => {
  it('normalizes a valid alarm', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'washing-machine',
        name: 'Washing Machine',
        delay: { hours: 1, minutes: 0, seconds: 0 },
        motionDurationSeconds: 10,
        repeatMode: 'count',
        repeatCount: 3,
      }],
    });

    expect(config.alarms[0]).toMatchObject({
      id: 'washing-machine',
      repeatMode: 'count',
      repeatCount: 3,
      homekitExposure: { cancelSwitch: true, remainingTime: false },
      accessoryNames: {
        trigger: 'Washing Machine Trigger',
        motion: 'Washing Machine Motion',
        reset: 'Washing Machine Reset',
        countdown: 'Washing Machine Countdown',
      },
    });
  });

  it('normalizes optional accessory names', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'timer',
        name: 'Timer',
        delay: { minutes: 30 },
        motionDurationSeconds: 10,
        repeatMode: 'once',
        accessoryNames: {
          trigger: 'Start Laundry Reminder',
          motion: 'Laundry Reminder Due',
          reset: 'Cancel Laundry Reminder',
          countdown: 'Laundry Time Remaining',
        },
      }],
    });

    expect(config.alarms[0]?.accessoryNames).toEqual({
      trigger: 'Start Laundry Reminder',
      motion: 'Laundry Reminder Due',
      reset: 'Cancel Laundry Reminder',
      countdown: 'Laundry Time Remaining',
    });
  });

  it('rejects invalid accessory names', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'bad-names',
        name: 'Bad Names',
        delay: { minutes: 1 },
        motionDurationSeconds: 10,
        repeatMode: 'once',
        accessoryNames: {
          trigger: '',
        },
      }],
    })).toThrow(/accessoryNames.trigger must be a non-empty string/u);
  });

  it('normalizes optional remaining time exposure', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'timer',
        name: 'Timer',
        delay: { minutes: 30 },
        motionDurationSeconds: 10,
        repeatMode: 'once',
        homekitExposure: {
          cancelSwitch: false,
          remainingTime: true,
        },
      }],
    });

    expect(config.alarms[0]?.homekitExposure).toEqual({
      cancelSwitch: false,
      remainingTime: true,
    });
  });

  it('rejects duplicate IDs', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [
        alarm('same'),
        alarm('same'),
      ],
    })).toThrow(ConfigValidationError);
  });

  it('allows one-shot alarms whose motion duration is longer than the delay', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'short-once',
        name: 'Short Once',
        delay: { seconds: 5 },
        motionDurationSeconds: 10,
        repeatMode: 'once',
      }],
    });

    expect(config.alarms[0]?.repeatMode).toBe('once');
  });

  it('allows repeated alarms whose motion duration overlaps the next occurrence', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'short-repeat',
        name: 'Short Repeat',
        delay: { seconds: 5 },
        motionDurationSeconds: 10,
        repeatMode: 'infinite',
      }],
    });

    expect(config.alarms[0]?.repeatMode).toBe('infinite');
  });

  it('rejects missing or empty structured delays', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'missing-delay',
        name: 'Missing Delay',
        motionDurationSeconds: 10,
        repeatMode: 'once',
      }],
    })).toThrow(/delay is required/u);

    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'empty-delay',
        name: 'Empty Delay',
        delay: {},
        motionDurationSeconds: 10,
        repeatMode: 'once',
      }],
    })).toThrow(/delay must be greater than zero/u);
  });

  it('rejects delay hours beyond one week', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'too-long',
        name: 'Too Long',
        delay: { hours: 169 },
        motionDurationSeconds: 10,
        repeatMode: 'once',
      }],
    })).toThrow(/delay.hours must be an integer between 0 and 168/u);
  });

  it('rejects invalid IDs, delays, durations, repeat modes, and unsafe cycles', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'bad id',
        name: 'Bad',
        delay: { seconds: 5 },
        motionDurationSeconds: 10,
        repeatMode: 'sometimes',
        repeatCount: 0,
      }],
    })).toThrow(ConfigValidationError);
  });
});

function alarm(id: string) {
  return {
    id,
    name: id,
    delay: { minutes: 1 },
    motionDurationSeconds: 10,
    repeatMode: 'once',
  };
}
