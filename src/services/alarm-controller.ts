import type { NormalizedAlarmConfig, RepeatMode } from '../config/types.js';
import type { Clock } from './clock.js';
import type { PersistentAlarmStore } from './persistence.js';
import type { AlarmPersistentState } from './state.js';
import { emptyAlarmState } from './state.js';
import { AlarmScheduler } from './scheduler.js';
import type { PluginLogger } from '../utils/logger.js';

export interface AlarmControllerCallbacks {
  readonly updateMotion: (detected: boolean) => void;
  readonly updateTriggerSwitch?: (on: boolean) => void;
  readonly updateCancelSwitch?: (on: boolean) => void;
  readonly updateCountdown?: (triggerAt: string | null, setDurationSeconds: number | null) => void;
}

export class AlarmController {
  private state: AlarmPersistentState = emptyAlarmState();
  private readonly triggerScheduler: AlarmScheduler;
  private readonly sensorScheduler: AlarmScheduler;
  private triggerResetTimer: NodeJS.Timeout | undefined;
  private cancelResetTimer: NodeJS.Timeout | undefined;

  public constructor(
    public readonly config: NormalizedAlarmConfig,
    private readonly store: PersistentAlarmStore,
    private readonly clock: Clock,
    private readonly logger: PluginLogger,
    private readonly callbacks: AlarmControllerCallbacks,
  ) {
    this.triggerScheduler = new AlarmScheduler(clock, () => this.checkTrigger());
    this.sensorScheduler = new AlarmScheduler(clock, () => this.checkSensor());
  }

  public async restore(): Promise<void> {
    this.state = this.store.getAlarm(this.config.id);
    this.callbacks.updateTriggerSwitch?.(false);
    this.callbacks.updateCancelSwitch?.(false);
    this.callbacks.updateCountdown?.(this.state.triggerAt, this.state.scheduleDelaySeconds);

    const now = this.clock.now();
    if (this.state.sensorActiveUntil && Date.parse(this.state.sensorActiveUntil) > now.getTime()) {
      this.callbacks.updateMotion(true);
      this.sensorScheduler.schedule(new Date(this.state.sensorActiveUntil));
    } else if (this.state.sensorActiveUntil) {
      this.state = { ...this.state, sensorActiveUntil: null };
      this.callbacks.updateMotion(false);
      await this.persist();
    } else {
      this.callbacks.updateMotion(false);
    }

    if (this.state.triggerAt) {
      if (Date.parse(this.state.triggerAt) <= now.getTime()) {
        await this.checkTrigger();
      } else {
        this.triggerScheduler.schedule(new Date(this.state.triggerAt));
      }
    }
  }

  public getState(): AlarmPersistentState {
    return this.state;
  }

  public async checkTrigger(): Promise<void> {
    if (!this.state.triggerAt || !this.state.scheduleDelaySeconds) {
      return;
    }
    if (Date.parse(this.state.triggerAt) > this.clock.now().getTime()) {
      this.triggerScheduler.schedule(new Date(this.state.triggerAt));
      return;
    }
    await this.handleDueTrigger();
  }

  public async checkSensor(): Promise<void> {
    if (!this.state.sensorActiveUntil) {
      return;
    }
    if (Date.parse(this.state.sensorActiveUntil) > this.clock.now().getTime()) {
      this.sensorScheduler.schedule(new Date(this.state.sensorActiveUntil));
      return;
    }
    await this.clearMotion();
  }

  public async trigger(): Promise<void> {
    this.clearTriggerResetTimer();
    const triggerAt = new Date(this.clock.now().getTime() + this.config.delaySeconds * 1000);
    this.state = {
      triggerAt: triggerAt.toISOString(),
      sensorActiveUntil: null,
      scheduleDelaySeconds: this.config.delaySeconds,
      repeatMode: this.config.repeatMode,
      repeatCount: this.config.repeatCount,
      completedTriggers: 0,
    };
    await this.persist();
    this.triggerScheduler.schedule(triggerAt);
    this.callbacks.updateCountdown?.(this.state.triggerAt, this.state.scheduleDelaySeconds);
    this.callbacks.updateTriggerSwitch?.(true);
    this.triggerResetTimer = setTimeout(() => this.callbacks.updateTriggerSwitch?.(false), 500);
    this.logger.info('[%s] Scheduled alarm for %s', this.config.id, triggerAt.toISOString());
  }

  public async triggerSwitchOff(): Promise<void> {
    this.callbacks.updateTriggerSwitch?.(false);
    this.logger.debug('[%s] Trigger switch returned OFF without cancelling schedule', this.config.id);
  }

  public async cancel(): Promise<void> {
    this.clearTriggerResetTimer();
    this.clearCancelResetTimer();
    this.triggerScheduler.cancel();
    this.sensorScheduler.cancel();
    this.state = emptyAlarmState();
    await this.persist();
    this.callbacks.updateMotion(false);
    this.callbacks.updateCountdown?.(this.state.triggerAt, this.state.scheduleDelaySeconds);
    this.callbacks.updateCancelSwitch?.(true);
    this.cancelResetTimer = setTimeout(() => this.callbacks.updateCancelSwitch?.(false), 500);
    this.logger.info('[%s] Alarm cancelled and reset', this.config.id);
  }

  public stop(): void {
    this.triggerScheduler.cancel();
    this.sensorScheduler.cancel();
    this.clearTriggerResetTimer();
    this.clearCancelResetTimer();
  }

  private async handleDueTrigger(): Promise<void> {
    if (!this.state.triggerAt || !this.state.scheduleDelaySeconds) {
      return;
    }

    const nowMs = this.clock.now().getTime();
    const firstDueMs = Date.parse(this.state.triggerAt);
    const delayMs = this.state.scheduleDelaySeconds * 1000;
    let completedAfterDue = this.state.completedTriggers;
    let theoreticalMs = firstDueMs;
    let emitted = false;

    while (theoreticalMs <= nowMs && canTrigger(this.state.repeatMode, this.state.repeatCount, completedAfterDue + 1)) {
      completedAfterDue += 1;
      theoreticalMs += delayMs;
      emitted = true;
    }

    if (!emitted) {
      this.state = { ...this.state, triggerAt: null };
      await this.persist();
      this.callbacks.updateCountdown?.(this.state.triggerAt, this.state.scheduleDelaySeconds);
      return;
    }

    await this.setMotion();
    const hasNext = canTrigger(this.state.repeatMode, this.state.repeatCount, completedAfterDue + 1);
    this.state = {
      ...this.state,
      triggerAt: hasNext ? new Date(theoreticalMs).toISOString() : null,
      completedTriggers: completedAfterDue,
    };
    await this.persist();
    this.callbacks.updateCountdown?.(this.state.triggerAt, this.state.scheduleDelaySeconds);

    if (hasNext) {
      this.triggerScheduler.schedule(new Date(theoreticalMs));
    } else {
      this.logger.info('[%s] Alarm schedule completed', this.config.id);
    }
  }

  private async setMotion(): Promise<void> {
    const activeUntil = new Date(this.clock.now().getTime() + this.config.motionDurationSeconds * 1000);
    if (this.state.sensorActiveUntil) {
      this.sensorScheduler.cancel();
      this.callbacks.updateMotion(false);
    }
    this.callbacks.updateMotion(true);
    this.state = { ...this.state, sensorActiveUntil: activeUntil.toISOString() };
    await this.persist();
    this.sensorScheduler.schedule(activeUntil);
    this.logger.info('[%s] Motion sensor triggered until %s', this.config.id, activeUntil.toISOString());
  }

  private async clearMotion(): Promise<void> {
    this.callbacks.updateMotion(false);
    this.state = { ...this.state, sensorActiveUntil: null };
    await this.persist();
    this.logger.debug('[%s] Motion sensor reset to not detected', this.config.id);
  }

  private async persist(): Promise<void> {
    await this.store.setAlarm(this.config.id, this.state);
  }

  private clearTriggerResetTimer(): void {
    if (this.triggerResetTimer) {
      clearTimeout(this.triggerResetTimer);
      this.triggerResetTimer = undefined;
    }
  }

  private clearCancelResetTimer(): void {
    if (this.cancelResetTimer) {
      clearTimeout(this.cancelResetTimer);
      this.cancelResetTimer = undefined;
    }
  }
}

function canTrigger(repeatMode: RepeatMode, repeatCount: number, nextTriggerNumber: number): boolean {
  if (repeatMode === 'infinite') {
    return true;
  }
  return nextTriggerNumber <= repeatCount;
}
