export type RepeatMode = 'once' | 'count' | 'infinite';

export interface HomeKitExposureConfig {
  readonly cancelSwitch?: boolean;
  readonly remainingTime?: boolean;
}

export interface DurationConfig {
  readonly hours?: number;
  readonly minutes?: number;
  readonly seconds?: number;
}

export interface AlarmConfig {
  readonly id?: string;
  readonly name?: string;
  readonly delay?: DurationConfig;
  readonly motionDurationSeconds?: number;
  readonly repeatMode?: RepeatMode;
  readonly repeatCount?: number;
  readonly homekitExposure?: HomeKitExposureConfig;
}

export interface PersistentAlarmPlatformConfig {
  readonly platform?: string;
  readonly name?: string;
  readonly debug?: boolean;
  readonly alarms?: readonly AlarmConfig[];
}

export interface NormalizedHomeKitExposureConfig {
  readonly cancelSwitch: boolean;
  readonly remainingTime: boolean;
}

export interface NormalizedAlarmConfig {
  readonly id: string;
  readonly name: string;
  readonly delaySeconds: number;
  readonly motionDurationSeconds: number;
  readonly repeatMode: RepeatMode;
  readonly repeatCount: number;
  readonly homekitExposure: NormalizedHomeKitExposureConfig;
}

export interface NormalizedPlatformConfig {
  readonly platform: 'PersistentAlarm';
  readonly name: string;
  readonly debug: boolean;
  readonly alarms: readonly NormalizedAlarmConfig[];
}
