import type { AlarmConfig, NormalizedAlarmConfig, NormalizedPlatformConfig, RepeatMode } from './types.js';
import { DEFAULTS, EMPTY_CONFIG } from './defaults.js';

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/u;
const REPEAT_MODES = new Set<RepeatMode>(['once', 'count', 'infinite']);
const MAX_DELAY_HOURS = 168;

export class ConfigValidationError extends Error {
  public constructor(public readonly issues: readonly string[]) {
    super(`Invalid PersistentAlarm configuration: ${issues.join('; ')}`);
    this.name = 'ConfigValidationError';
  }
}

export function normalizeConfig(input: unknown): NormalizedPlatformConfig {
  if (!isRecord(input)) {
    return EMPTY_CONFIG;
  }

  if (input.platform !== 'PersistentAlarm') {
    throw new ConfigValidationError(['platform must be PersistentAlarm']);
  }

  const issues: string[] = [];
  const name = optionalString(input.name, DEFAULTS.platformName, 'name', issues);
  const debug = optionalBoolean(input.debug, DEFAULTS.debug, 'debug', issues);
  const alarms = normalizeAlarms(input.alarms, issues);

  if (issues.length > 0) {
    throw new ConfigValidationError(issues);
  }

  return { platform: 'PersistentAlarm', name, debug, alarms };
}

function normalizeAlarms(value: unknown, issues: string[]): readonly NormalizedAlarmConfig[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    issues.push('alarms must be an array');
    return [];
  }

  const ids = new Set<string>();
  return value.map((alarm: AlarmConfig, index) => {
    const label = `alarms[${index}]`;
    const id = cleanId(alarm.id, `${label}.id`, issues);
    if (ids.has(id)) {
      issues.push(`${label}.id must be unique`);
    }
    ids.add(id);

    const delaySeconds = normalizeDuration(alarm.delay, `${label}.delay`, issues);
    const motionDurationSeconds = boundedInteger(alarm.motionDurationSeconds, 1, 24 * 60 * 60, `${label}.motionDurationSeconds`, issues);
    const repeatMode = normalizeRepeatMode(alarm.repeatMode, `${label}.repeatMode`, issues);

    const repeatCount = boundedInteger(alarm.repeatCount, 1, 10000, `${label}.repeatCount`, issues, DEFAULTS.repeatCount);
    if (repeatMode === 'count' && repeatCount < 1) {
      issues.push(`${label}.repeatCount must be at least 1 when repeatMode is count`);
    }

    const name = cleanRequiredString(alarm.name, `${label}.name`, issues);

    return {
      id,
      name,
      delaySeconds,
      motionDurationSeconds,
      repeatMode,
      repeatCount: repeatMode === 'once' ? 1 : repeatCount,
      homekitExposure: {
        cancelSwitch: optionalBoolean(alarm.homekitExposure?.cancelSwitch, DEFAULTS.cancelSwitch, `${label}.homekitExposure.cancelSwitch`, issues),
        remainingTime: optionalBoolean(alarm.homekitExposure?.remainingTime, DEFAULTS.remainingTime, `${label}.homekitExposure.remainingTime`, issues),
      },
      accessoryNames: normalizeAccessoryNames(alarm.accessoryNames, name, label, issues),
    };
  });
}

function normalizeAccessoryNames(value: unknown, alarmName: string, label: string, issues: string[]) {
  if (value !== undefined && !isRecord(value)) {
    issues.push(`${label}.accessoryNames must be an object`);
    return defaultAccessoryNames(alarmName);
  }

  return {
    trigger: optionalAccessoryName(value?.trigger, `${alarmName} Trigger`, `${label}.accessoryNames.trigger`, issues),
    motion: optionalAccessoryName(value?.motion, `${alarmName} Motion`, `${label}.accessoryNames.motion`, issues),
    reset: optionalAccessoryName(value?.reset, `${alarmName} Reset`, `${label}.accessoryNames.reset`, issues),
    countdown: optionalAccessoryName(value?.countdown, `${alarmName} Countdown`, `${label}.accessoryNames.countdown`, issues),
  };
}

function defaultAccessoryNames(alarmName: string) {
  return {
    trigger: `${alarmName} Trigger`,
    motion: `${alarmName} Motion`,
    reset: `${alarmName} Reset`,
    countdown: `${alarmName} Countdown`,
  };
}

function cleanId(value: unknown, label: string, issues: string[]): string {
  const id = cleanRequiredString(value, label, issues);
  if (id && !ID_PATTERN.test(id)) {
    issues.push(`${label} must start with an alphanumeric character and contain only letters, numbers, underscores, or hyphens`);
  }
  return id;
}

function normalizeRepeatMode(value: unknown, label: string, issues: string[]): RepeatMode {
  if (value === undefined) {
    return DEFAULTS.repeatMode;
  }
  if (typeof value !== 'string' || !REPEAT_MODES.has(value as RepeatMode)) {
    issues.push(`${label} must be once, count, or infinite`);
    return DEFAULTS.repeatMode;
  }
  return value as RepeatMode;
}

function normalizeDuration(value: unknown, label: string, issues: string[]): number {
  if (!isRecord(value)) {
    issues.push(`${label} is required`);
    return 1;
  }

  const hours = boundedInteger(value.hours, 0, MAX_DELAY_HOURS, `${label}.hours`, issues, 0);
  const minutes = boundedInteger(value.minutes, 0, 59, `${label}.minutes`, issues, 0);
  const seconds = boundedInteger(value.seconds, 0, 59, `${label}.seconds`, issues, 0);
  const totalSeconds = (hours * 60 * 60) + (minutes * 60) + seconds;
  if (totalSeconds <= 0) {
    issues.push(`${label} must be greater than zero`);
    return 1;
  }
  return totalSeconds;
}

function boundedInteger(value: unknown, min: number, max: number, label: string, issues: string[], fallback?: number): number {
  if (value === undefined && fallback !== undefined) {
    return fallback;
  }
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    issues.push(`${label} must be an integer between ${min} and ${max}`);
    return fallback ?? min;
  }
  return value as number;
}

function optionalBoolean(value: unknown, fallback: boolean, label: string, issues: string[]): boolean {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== 'boolean') {
    issues.push(`${label} must be a boolean`);
    return fallback;
  }
  return value;
}

function optionalString(value: unknown, fallback: string, label: string, issues: string[]): string {
  if (value === undefined) {
    return fallback;
  }
  return cleanRequiredString(value, label, issues) || fallback;
}

function optionalAccessoryName(value: unknown, fallback: string, label: string, issues: string[]): string {
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push(`${label} must be a non-empty string`);
    return fallback;
  }
  return value.trim();
}

function cleanRequiredString(value: unknown, label: string, issues: string[]): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push(`${label} is required`);
    return '';
  }
  return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
