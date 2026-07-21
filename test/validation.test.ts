import { describe, expect, it } from 'vitest';
import { ConfigValidationError, normalizeConfig } from '../src/config/validation.js';

describe('configuration validation', () => {
  it('normalizes a valid alarm', () => {
    const config = normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'washing-machine',
        name: 'Washing Machine',
        delaySeconds: 3600,
        motionDurationSeconds: 10,
        repeatMode: 'count',
        repeatCount: 3,
      }],
    });

    expect(config.alarms[0]).toMatchObject({
      id: 'washing-machine',
      repeatMode: 'count',
      repeatCount: 3,
      homekitExposure: { cancelSwitch: true },
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
        delaySeconds: 5,
        motionDurationSeconds: 10,
        repeatMode: 'once',
      }],
    });

    expect(config.alarms[0]?.repeatMode).toBe('once');
  });

  it('rejects repeated alarms whose motion duration overlaps the next occurrence', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'short-repeat',
        name: 'Short Repeat',
        delaySeconds: 5,
        motionDurationSeconds: 10,
        repeatMode: 'infinite',
      }],
    })).toThrow(/delaySeconds must be greater than motionDurationSeconds for repeated alarms/u);
  });

  it('rejects invalid IDs, delays, durations, repeat modes, and unsafe cycles', () => {
    expect(() => normalizeConfig({
      platform: 'PersistentAlarm',
      alarms: [{
        id: 'bad id',
        name: 'Bad',
        delaySeconds: 5,
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
    delaySeconds: 60,
    motionDurationSeconds: 10,
    repeatMode: 'once',
  };
}
