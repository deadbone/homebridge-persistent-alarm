import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ManualClock } from './helpers.js';
import { AlarmScheduler } from '../src/services/scheduler.js';

describe('AlarmScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports async due-handler errors without leaking rejected timer promises', async () => {
    const clock = new ManualClock();
    const onError = vi.fn();
    const scheduler = new AlarmScheduler(
      clock,
      async () => {
        throw new Error('store unavailable');
      },
      undefined,
      onError,
    );

    scheduler.schedule(clock.now());
    await vi.runOnlyPendingTimersAsync();

    expect(onError).toHaveBeenCalledOnce();
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((onError.mock.calls[0]?.[0] as Error).message).toBe('store unavailable');
  });
});
