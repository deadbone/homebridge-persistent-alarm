import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { AlarmPersistentState, PersistentStateFile } from './state.js';
import { emptyAlarmState } from './state.js';
import type { PluginLogger } from '../utils/logger.js';
import type { RepeatMode } from '../config/types.js';
import { PERSISTENCE_FILE_NAME } from '../settings.js';

const REPEAT_MODES = new Set<RepeatMode>(['once', 'count', 'infinite']);

export class PersistentAlarmStore {
  private state: PersistentStateFile = { schemaVersion: 1, alarms: {} };
  private saveQueue: Promise<void> = Promise.resolve();

  public constructor(
    private readonly storageDirectory: string,
    private readonly logger: PluginLogger,
  ) {}

  public get filePath(): string {
    return join(this.storageDirectory, PERSISTENCE_FILE_NAME);
  }

  public async load(configuredAlarmIds: readonly string[]): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      this.state = validateState(JSON.parse(raw), this.logger);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        this.state = { schemaVersion: 1, alarms: {} };
        return;
      }
      this.logger.warn('Persistent alarm state could not be loaded and will be rebuilt: %s', error instanceof Error ? error.message : String(error));
      this.state = { schemaVersion: 1, alarms: {} };
    }

    const configuredIds = new Set(configuredAlarmIds);
    const activeAlarms: Record<string, AlarmPersistentState> = {};
    for (const [alarmId, alarmState] of Object.entries(this.state.alarms)) {
      if (!configuredIds.has(alarmId)) {
        this.logger.info('[%s] Removed obsolete persistent alarm state', alarmId);
      } else {
        activeAlarms[alarmId] = alarmState;
      }
    }
    const changed = Object.keys(activeAlarms).length !== Object.keys(this.state.alarms).length;
    this.state = { schemaVersion: 1, alarms: activeAlarms };
    if (changed) {
      await this.save();
    }
  }

  public getAlarm(alarmId: string): AlarmPersistentState {
    return this.state.alarms[alarmId] ?? emptyAlarmState();
  }

  public async setAlarm(alarmId: string, alarmState: AlarmPersistentState): Promise<void> {
    this.state.alarms[alarmId] = alarmState;
    await this.save();
  }

  private async save(): Promise<void> {
    const queuedSave = this.saveQueue.then(() => this.saveNow());
    this.saveQueue = queuedSave.catch(() => undefined);
    await queuedSave;
  }

  private async saveNow(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryFile = `${this.filePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(temporaryFile, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
    await rename(temporaryFile, this.filePath);
  }
}

function validateState(value: unknown, logger: PluginLogger): PersistentStateFile {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.alarms)) {
    logger.warn('Persistent alarm state has an unsupported format; ignoring it');
    return { schemaVersion: 1, alarms: {} };
  }

  const alarms: Record<string, AlarmPersistentState> = {};
  for (const [alarmId, alarmState] of Object.entries(value.alarms)) {
    const normalized = validateAlarmState(alarmId, alarmState, logger);
    if (normalized) {
      alarms[alarmId] = normalized;
    }
  }
  return { schemaVersion: 1, alarms };
}

function validateAlarmState(alarmId: string, value: unknown, logger: PluginLogger): AlarmPersistentState | undefined {
  if (!isRecord(value)) {
    logger.warn('[%s] Ignoring invalid persistent alarm entry', alarmId);
    return undefined;
  }

  const repeatMode = typeof value.repeatMode === 'string' && REPEAT_MODES.has(value.repeatMode as RepeatMode) ? value.repeatMode as RepeatMode : 'once';
  const repeatCount = positiveInteger(value.repeatCount) ?? 1;
  const completedTriggers = nonNegativeInteger(value.completedTriggers) ?? 0;
  const scheduleDelaySeconds = positiveInteger(value.scheduleDelaySeconds);

  return {
    triggerAt: validIsoDate(value.triggerAt) ? value.triggerAt : null,
    sensorActiveUntil: validIsoDate(value.sensorActiveUntil) ? value.sensorActiveUntil : null,
    scheduleDelaySeconds,
    repeatMode,
    repeatCount,
    completedTriggers,
  };
}

function validIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function positiveInteger(value: unknown): number | null {
  return Number.isInteger(value) && (value as number) > 0 ? value as number : null;
}

function nonNegativeInteger(value: unknown): number | null {
  return Number.isInteger(value) && (value as number) >= 0 ? value as number : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
