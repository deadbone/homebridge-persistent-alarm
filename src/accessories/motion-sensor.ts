import type { PlatformAccessory, Service } from 'homebridge';
import type { PersistentAlarmPlatform } from '../platform.js';

export class MotionSensorAccessory {
  private readonly service: Service;
  private detected = false;

  public constructor(
    private readonly platform: PersistentAlarmPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const { Characteristic, Service: HapService } = this.platform.api.hap;
    this.service = this.accessory.getService(HapService.MotionSensor) ?? this.accessory.addService(HapService.MotionSensor);
    this.service.setCharacteristic(Characteristic.Name, accessory.displayName);
    this.service.getCharacteristic(Characteristic.MotionDetected)
      .onGet(() => this.detected);
  }

  public update(detected: boolean): void {
    this.detected = detected;
    this.service.updateCharacteristic(this.platform.api.hap.Characteristic.MotionDetected, detected);
  }
}
