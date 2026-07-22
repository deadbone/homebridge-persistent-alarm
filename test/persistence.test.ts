import { readFile, readdir, rm } from 'node:fs/promises';
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
