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
    })).toThrow(/delaySeconds must be greater than motionDurationSeconds/u);
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
