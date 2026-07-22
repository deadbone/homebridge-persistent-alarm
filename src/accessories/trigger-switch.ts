import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import type { PersistentAlarmPlatform } from '../platform.js';
import type { AlarmController } from '../services/alarm-controller.js';

export class TriggerSwitchAccessory {
  private readonly service: Service;
  private on = false;

  public constructor(
    private readonly platform: PersistentAlarmPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly controller: AlarmController,
  ) {
    const { Characteristic, Service: HapService } = this.platform.api.hap;
    this.service = this.accessory.getService(HapService.Switch) ?? this.accessory.addService(HapService.Switch);
    this.service.setCharacteristic(Characteristic.Name, accessory.displayName);
    this.service.getCharacteristic(Characteristic.On)
      .onGet(() => this.on)
      .onSet((value) => this.handleSet(value));
  }

  public update(on: boolean): void {
    this.on = on;
    this.service.updateCharacteristic(this.platform.api.hap.Characteristic.On, on);
  }

  private async handleSet(value: CharacteristicValue): Promise<void> {
    try {
      if (value === true) {
        await this.controller.trigger();
        return;
      }
      await this.controller.triggerSwitchOff();
    } catch (error) {
      this.platform.logger.error('[%s] Trigger switch update failed: %s', this.controller.config.id, errorMessage(error));
      this.update(false);
    }
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
