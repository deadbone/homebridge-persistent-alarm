import type { Clock } from './clock.js';

const NODE_TIMEOUT_LIMIT_MS = 2_147_483_647;

export class AlarmScheduler {
  private timer: NodeJS.Timeout | undefined;

  public constructor(
    private readonly clock: Clock,
    private readonly onDue: () => void | Promise<void>,
    private readonly maxWaitMs: number = NODE_TIMEOUT_LIMIT_MS,
    private readonly onError: (error: unknown) => void = () => undefined,
  ) {}

  public schedule(target: Date): void {
    this.cancel();
    this.scheduleNext(target);
  }

  public cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private scheduleNext(target: Date): void {
    const waitMs = Math.max(0, target.getTime() - this.clock.now().getTime());
    const boundedWait = Math.min(waitMs, this.maxWaitMs);
    this.timer = setTimeout(async () => {
      this.timer = undefined;
      if (this.clock.now().getTime() >= target.getTime()) {
        try {
          await this.onDue();
        } catch (error) {
          this.onError(error);
        }
        return;
      }
      this.scheduleNext(target);
    }, boundedWait);
  }
}
