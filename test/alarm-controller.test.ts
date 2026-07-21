import { rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleAlarm, createLogger, ManualClock, temporaryDirectory } from './helpers.js';
import { PluginLogger } from '../src/utils/logger.js';
import { PersistentAlarmStore } from '../src/services/persistence.js';
import { AlarmController } from '../src/services/alarm-controller.js';
import type { AlarmControllerCallbacks } from '../src/services/alarm-controller.js';

describe('AlarmController', () => {
  let directories: string[] = [];
  let controllers: AlarmController[] = [];

  beforeEach(() => {
    vi.useFakeTimers();
    directories = [];
    controllers = [];
  });

  afterEach(() => {
    for (const controller of controllers) {
      controller.stop();
    }
    vi.useRealTimers();
    for (const directory of directories) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('creates a persistent schedule when the trigger switch turns ON', async () => {
    const harness = await createHarness();
    await harness.controller.trigger();

    expect(harness.controller.getState().triggerAt).toBe('2026-07-21T08:01:00.000Z');
    expect(harness.trigger).toHaveBeenCalledWith(true);

    await vi.advanceTimersByTimeAsync(500);
    expect(harness.trigger).toHaveBeenLastCalledWith(false);
  });

  it('does not cancel when the trigger switch returns OFF', async () => {
    const harness = await createHarness();
    await harness.controller.trigger();
    const triggerAt = harness.controller.getState().triggerAt;

    await harness.controller.triggerSwitchOff();

    expect(harness.controller.getState().triggerAt).toBe(triggerAt);
  });

  it('replaces an existing schedule when triggered twice', async () => {
    const harness = await createHarness();
    await harness.controller.trigger();
    harness.clock.advance(30);
    await harness.controller.trigger();

    expect(harness.controller.getState().triggerAt).toBe('2026-07-21T08:01:30.000Z');
    expect(harness.controller.getState().completedTriggers).toBe(0);
  });

  it('runs once and resets the motion sensor', async () => {
    const harness = await createHarness();
    await harness.controller.trigger();

    harness.clock.advance(60);
    await harness.controller.checkTrigger();
    expect(harness.motion).toHaveBeenLastCalledWith(true);
    expect(harness.controller.getState().triggerAt).toBeNull();
    expect(harness.controller.getState().completedTriggers).toBe(1);

    harness.clock.advance(10);
    await harness.controller.checkSensor();
    expect(harness.motion).toHaveBeenLastCalledWith(false);
    expect(harness.controller.getState().sensorActiveUntil).toBeNull();
  });

  it('uses theoretical cadence for fixed count repeats', async () => {
    const harness = await createHarness({ repeatMode: 'count', repeatCount: 3 });
    await harness.controller.trigger();

    harness.clock.set('2026-07-21T08:01:05.000Z');
    await harness.controller.checkTrigger();

    expect(harness.controller.getState().completedTriggers).toBe(1);
    expect(harness.controller.getState().triggerAt).toBe('2026-07-21T08:02:00.000Z');
  });

  it('cancels schedules and active sensors only through reset', async () => {
    const harness = await createHarness();
    await harness.controller.trigger();
    await harness.controller.cancel();

    expect(harness.controller.getState()).toMatchObject({
      triggerAt: null,
      sensorActiveUntil: null,
      completedTriggers: 0,
    });
    expect(harness.motion).toHaveBeenLastCalledWith(false);
    expect(harness.cancel).toHaveBeenCalledWith(true);
  });

  it('restores future schedules from persistence', async () => {
    const first = await createHarness();
    await first.controller.trigger();

    const second = await createHarness({}, first.directory);
    await second.controller.restore();

    expect(second.controller.getState().triggerAt).toBe('2026-07-21T08:01:00.000Z');
    expect(second.trigger).toHaveBeenCalledWith(false);
  });

  it('emits one immediate event for missed triggers and advances repeat state', async () => {
    const first = await createHarness({ repeatMode: 'count', repeatCount: 3 });
    await first.controller.trigger();

    const second = await createHarness({ repeatMode: 'count', repeatCount: 3 }, first.directory);
    second.clock.set('2026-07-21T08:02:30.000Z');
    await second.controller.restore();

    expect(second.motion).toHaveBeenLastCalledWith(true);
    expect(second.controller.getState().completedTriggers).toBe(2);
    expect(second.controller.getState().triggerAt).toBe('2026-07-21T08:03:00.000Z');
  });

  async function createHarness(overrides = {}, existingDirectory?: string) {
    const directory = existingDirectory ?? temporaryDirectory();
    if (!existingDirectory) {
      directories.push(directory);
    }
    const log = createLogger();
    const logger = new PluginLogger(log, true);
    const store = new PersistentAlarmStore(directory, logger);
    await store.load(['washing-machine']);
    const clock = new ManualClock();
    const motion = vi.fn();
    const trigger = vi.fn();
    const cancel = vi.fn();
    const callbacks: AlarmControllerCallbacks = {
      updateMotion: motion,
      updateTriggerSwitch: trigger,
      updateCancelSwitch: cancel,
    };
    const controller = new AlarmController({ ...sampleAlarm, ...overrides }, store, clock, logger, callbacks);
    controllers.push(controller);
    return { directory, store, clock, controller, motion, trigger, cancel };
  }
});
