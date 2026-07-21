import type { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from 'homebridge';
import { CancelResetSwitchAccessory } from './accessories/cancel-reset-switch.js';
import { CountdownValveAccessory } from './accessories/countdown-valve.js';
import { MotionSensorAccessory } from './accessories/motion-sensor.js';
import { TriggerSwitchAccessory } from './accessories/trigger-switch.js';
import { ConfigValidationError, normalizeConfig } from './config/validation.js';
import type { NormalizedAlarmConfig, NormalizedPlatformConfig } from './config/types.js';
import { SystemClock } from './services/clock.js';
import { AlarmController } from './services/alarm-controller.js';
import { PersistentAlarmStore } from './services/persistence.js';
import { ACCESSORY_UUID_NAMESPACE, PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { PluginLogger } from './utils/logger.js';
import { sanitizeHomeKitName } from './utils/security.js';

type AccessoryRole = 'trigger-switch' | 'motion-sensor' | 'cancel-reset-switch' | 'countdown-valve';

interface HomebridgeUserPaths {
  readonly persistPath?: () => string;
  readonly storagePath?: () => string;
}

export class PersistentAlarmPlatform implements DynamicPlatformPlugin {
  public readonly accessories = new Map<string, PlatformAccessory>();
  public readonly logger: PluginLogger;
  public readonly configData: NormalizedPlatformConfig;
  public readonly store: PersistentAlarmStore;
  private readonly clock = new SystemClock();
  private readonly controllers = new Map<string, AlarmController>();
  private readonly triggerAccessories = new Map<string, TriggerSwitchAccessory>();
  private readonly cancelAccessories = new Map<string, CancelResetSwitchAccessory>();
  private readonly motionAccessories = new Map<string, MotionSensorAccessory>();
  private readonly countdownAccessories = new Map<string, CountdownValveAccessory>();

  public constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    try {
      this.configData = normalizeConfig(config);
    } catch (error) {
      if (error instanceof ConfigValidationError) {
        log.error(error.message);
      }
      throw error;
    }

    this.logger = new PluginLogger(log, this.configData.debug);
    this.store = new PersistentAlarmStore(resolvePersistenceDirectory(api), this.logger);

    this.api.on('didFinishLaunching', () => {
      void this.registerConfiguredAccessories();
    });
    this.api.on('shutdown', () => {
      for (const controller of this.controllers.values()) {
        controller.stop();
      }
      for (const accessory of this.countdownAccessories.values()) {
        accessory.stop();
      }
    });
  }

  public configureAccessory(accessory: PlatformAccessory): void {
    this.logger.info('Loading accessory from cache: %s', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  private async registerConfiguredAccessories(): Promise<void> {
    await this.store.load(this.configData.alarms.map((alarm) => alarm.id));
    const expectedUUIDs = new Set<string>();

    for (const alarm of this.configData.alarms) {
      const controller = new AlarmController(alarm, this.store, this.clock, this.logger, {
        updateMotion: (detected) => this.motionAccessories.get(alarm.id)?.update(detected),
        updateTriggerSwitch: (on) => this.triggerAccessories.get(alarm.id)?.update(on),
        updateCancelSwitch: (on) => this.cancelAccessories.get(alarm.id)?.update(on),
        updateCountdown: (triggerAt, setDurationSeconds) => this.countdownAccessories.get(alarm.id)?.update(triggerAt, setDurationSeconds),
      });
      this.controllers.set(alarm.id, controller);

      expectedUUIDs.add(this.registerTriggerSwitch(alarm, controller));
      expectedUUIDs.add(this.registerMotionSensor(alarm));
      if (alarm.homekitExposure.cancelSwitch) {
        expectedUUIDs.add(this.registerCancelSwitch(alarm, controller));
      }
      if (alarm.homekitExposure.remainingTime) {
        expectedUUIDs.add(this.registerCountdownValve(alarm));
      }
      await controller.restore();
    }

    for (const [uuid, accessory] of this.accessories) {
      if (!expectedUUIDs.has(uuid)) {
        this.logger.info('Removing stale accessory from cache: %s', accessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        this.accessories.delete(uuid);
      }
    }
  }

  private registerTriggerSwitch(alarm: NormalizedAlarmConfig, controller: AlarmController): string {
    const accessory = this.registerOrRestoreAccessory(alarm, 'trigger-switch', alarm.accessoryNames.trigger);
    const switchAccessory = new TriggerSwitchAccessory(this, accessory, controller);
    this.triggerAccessories.set(alarm.id, switchAccessory);
    return accessory.UUID;
  }

  private registerMotionSensor(alarm: NormalizedAlarmConfig): string {
    const accessory = this.registerOrRestoreAccessory(alarm, 'motion-sensor', alarm.accessoryNames.motion);
    const motionAccessory = new MotionSensorAccessory(this, accessory);
    this.motionAccessories.set(alarm.id, motionAccessory);
    return accessory.UUID;
  }

  private registerCancelSwitch(alarm: NormalizedAlarmConfig, controller: AlarmController): string {
    const accessory = this.registerOrRestoreAccessory(alarm, 'cancel-reset-switch', alarm.accessoryNames.reset);
    const switchAccessory = new CancelResetSwitchAccessory(this, accessory, controller);
    this.cancelAccessories.set(alarm.id, switchAccessory);
    return accessory.UUID;
  }

  private registerCountdownValve(alarm: NormalizedAlarmConfig): string {
    const accessory = this.registerOrRestoreAccessory(alarm, 'countdown-valve', alarm.accessoryNames.countdown);
    const countdownAccessory = new CountdownValveAccessory(this, accessory);
    this.countdownAccessories.set(alarm.id, countdownAccessory);
    return accessory.UUID;
  }

  private registerOrRestoreAccessory(alarm: NormalizedAlarmConfig, role: AccessoryRole, displayName: string): PlatformAccessory {
    const uuid = this.accessoryUuid(alarm.id, role);
    const sanitizedDisplayName = sanitizeHomeKitName(displayName);
    const existingAccessory = this.accessories.get(uuid);
    if (existingAccessory) {
      existingAccessory.displayName = sanitizedDisplayName;
      existingAccessory.context.alarmId = alarm.id;
      existingAccessory.context.role = role;
      this.api.updatePlatformAccessories([existingAccessory]);
      return existingAccessory;
    }

    const accessory = new this.api.platformAccessory(sanitizedDisplayName, uuid);
    accessory.context.alarmId = alarm.id;
    accessory.context.role = role;
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    this.accessories.set(uuid, accessory);
    return accessory;
  }

  private accessoryUuid(alarmId: string, role: AccessoryRole): string {
    return this.api.hap.uuid.generate(`${ACCESSORY_UUID_NAMESPACE}:${alarmId}:${role}`);
  }
}

function resolvePersistenceDirectory(api: API): string {
  const user = api.user as HomebridgeUserPaths | undefined;
  return user?.persistPath?.() ?? user?.storagePath?.() ?? process.cwd();
}
