import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { afterEach, describe, expect, it } from 'vitest';
import { createLogger, temporaryDirectory } from './helpers.js';
import { PersistentAlarmStore } from '../src/services/persistence.js';
import { PluginLogger } from '../src/utils/logger.js';
import type { AlarmPersistentState } from '../src/services/state.js';

describe('PersistentAlarmStore', () => {
  const directories: string[] = [];

  afterEach(async () => {
    await Promise.all(directories.map((directory) => rm(directory, { recursive: true, force: true })));
    directories.length = 0;
  });

  it('serializes concurrent saves without temporary file collisions', async () => {
    const directory = temporaryDirectory();
    directories.push(directory);
    const logger = new PluginLogger(createLogger(), true);
    const store = new PersistentAlarmStore(directory, logger);
    await store.load(['a', 'b']);

    await Promise.all([
      store.setAlarm('a', state('2026-07-22T13:00:00.000Z')),
      store.setAlarm('b', state('2026-07-22T13:01:00.000Z')),
    ]);

    const raw = await readFile(store.filePath, 'utf8');
    const saved = JSON.parse(raw) as { alarms: Record<string, AlarmPersistentState> };

    expect(saved.alarms.a?.triggerAt).toBe('2026-07-22T13:00:00.000Z');
    expect(saved.alarms.b?.triggerAt).toBe('2026-07-22T13:01:00.000Z');
    await expect(readdir(directory)).resolves.toEqual(['homebridge-persistent-alarm.json']);
  });

  it('restores a legacy schedule and removes obsolete alarms from disk', async () => {
    const directory = temporaryDirectory();
    directories.push(directory);
    const store = new PersistentAlarmStore(directory, new PluginLogger(createLogger(), true));
    const triggerAt = '2026-07-22T13:00:00.000Z';
    await writeFile(store.filePath, JSON.stringify({
      schemaVersion: 1,
      alarms: {
        retained: { triggerAt, repeatMode: 'count', repeatCount: 3, completedTriggers: 1 },
        obsolete: state('2026-07-22T13:01:00.000Z'),
      },
    }));

    await store.load(['retained']);

    const retained: AlarmPersistentState = {
      triggerAt,
      sensorActiveUntil: null,
      scheduleDelaySeconds: null,
      repeatMode: 'count',
      repeatCount: 3,
      completedTriggers: 1,
    };
    expect(store.getAlarm('retained')).toEqual(retained);
    expect(store.getAlarm('obsolete')).toMatchObject({ triggerAt: null, sensorActiveUntil: null });
    expect(JSON.parse(await readFile(store.filePath, 'utf8'))).toEqual({
      schemaVersion: 1,
      alarms: { retained },
    });
  });

  it('can persist a new schedule after a malformed state file', async () => {
    const directory = temporaryDirectory();
    directories.push(directory);
    const log = createLogger();
    const logger = new PluginLogger(log, true);
    const store = new PersistentAlarmStore(directory, logger);
    await writeFile(store.filePath, '{');

    await store.load(['alarm']);

    expect(log.warn).toHaveBeenCalledOnce();
    expect(store.getAlarm('alarm')).toMatchObject({ triggerAt: null, sensorActiveUntil: null });
    const saved = state('2026-07-22T13:00:00.000Z');
    await store.setAlarm('alarm', saved);

    const restarted = new PersistentAlarmStore(directory, logger);
    await restarted.load(['alarm']);
    expect(restarted.getAlarm('alarm')).toEqual(saved);
  });
});

function state(triggerAt: string): AlarmPersistentState {
  return {
    triggerAt,
    sensorActiveUntil: null,
    scheduleDelaySeconds: 120,
    repeatMode: 'once',
    repeatCount: 1,
    completedTriggers: 0,
  };
}
