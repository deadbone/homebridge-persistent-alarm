import type { PlatformAccessory, Service } from 'homebridge';
import type { PersistentAlarmPlatform } from '../platform.js';

const MAX_TIMER_SECONDS = 168 * 60 * 60;
const REFRESH_INTERVAL_MS = 30 * 1000;

export class CountdownValveAccessory {
  private readonly service: Service;
  private triggerAt: string | null = null;
  private setDurationSeconds = 0;
  private refreshTimer: NodeJS.Timeout | undefined;

  public constructor(
    private readonly platform: PersistentAlarmPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const { Characteristic, Service: HapService } = this.platform.api.hap;
    this.service = this.accessory.getService(HapService.Valve) ?? this.accessory.addService(HapService.Valve);
    this.service.setCharacteristic(Characteristic.Name, accessory.displayName);
    this.service.setCharacteristic(Characteristic.ValveType, Characteristic.ValveType.GENERIC_VALVE);
    this.service.getCharacteristic(Characteristic.Active)
      .onGet(() => this.activeValue())
      .onSet(() => this.handleIgnoredWrite());
    this.service.getCharacteristic(Characteristic.InUse)
      .onGet(() => this.inUseValue());
    this.service.getCharacteristic(Characteristic.RemainingDuration)
      .setProps({ maxValue: MAX_TIMER_SECONDS })
      .onGet(() => this.remainingSeconds());
    this.service.getCharacteristic(Characteristic.SetDuration)
      .setProps({ maxValue: MAX_TIMER_SECONDS })
      .onGet(() => this.setDurationSeconds)
      .onSet(() => this.handleIgnoredWrite());
    this.publish();
  }

  public update(triggerAt: string | null, setDurationSeconds: number | null): void {
    this.triggerAt = triggerAt;
    this.setDurationSeconds = setDurationSeconds ?? 0;
    this.publish();
  }

  public stop(): void {
    this.clearRefreshTimer();
  }

  private handleIgnoredWrite(): void {
    this.publish();
  }

  private publish(): void {
    const { Characteristic } = this.platform.api.hap;
    const remaining = this.remainingSeconds();
    const hasSchedule = remaining > 0;

    this.service.updateCharacteristic(Characteristic.Active, hasSchedule ? Characteristic.Active.ACTIVE : Characteristic.Active.INACTIVE);
    this.service.updateCharacteristic(Characteristic.InUse, hasSchedule ? Characteristic.InUse.IN_USE : Characteristic.InUse.NOT_IN_USE);
    this.service.updateCharacteristic(Characteristic.RemainingDuration, remaining);
    this.service.updateCharacteristic(Characteristic.SetDuration, this.setDurationSeconds);
    this.updateRefreshTimer(hasSchedule);
  }

  private activeValue(): number {
    return this.remainingSeconds() > 0
      ? this.platform.api.hap.Characteristic.Active.ACTIVE
      : this.platform.api.hap.Characteristic.Active.INACTIVE;
  }

  private inUseValue(): number {
    return this.remainingSeconds() > 0
      ? this.platform.api.hap.Characteristic.InUse.IN_USE
      : this.platform.api.hap.Characteristic.InUse.NOT_IN_USE;
  }

  private remainingSeconds(): number {
    if (!this.triggerAt) {
      return 0;
    }
    const dueAtMs = Date.parse(this.triggerAt);
    if (!Number.isFinite(dueAtMs)) {
      return 0;
    }
    return Math.max(0, Math.ceil((dueAtMs - Date.now()) / 1000));
  }

  private updateRefreshTimer(hasSchedule: boolean): void {
    if (!hasSchedule) {
      this.clearRefreshTimer();
      return;
    }
    if (!this.refreshTimer) {
      this.refreshTimer = setInterval(() => this.publish(), REFRESH_INTERVAL_MS);
    }
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }
}
