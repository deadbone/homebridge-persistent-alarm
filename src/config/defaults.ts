import { DEFAULT_PLATFORM_NAME } from '../settings.js';
import type { NormalizedPlatformConfig } from './types.js';

export const DEFAULTS = {
  platformName: DEFAULT_PLATFORM_NAME,
  debug: false,
  motionDurationSeconds: 10,
  repeatMode: 'once',
  repeatCount: 1,
  cancelSwitch: true,
} as const;

export const EMPTY_CONFIG: NormalizedPlatformConfig = {
  platform: 'PersistentAlarm',
  name: DEFAULTS.platformName,
  debug: DEFAULTS.debug,
  alarms: [],
};
