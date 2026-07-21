import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountdownValveAccessory } from '../src/accessories/countdown-valve.js';

describe('CountdownValveAccessory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-21T08:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('publishes inactive defaults before a schedule exists', () => {
    const { accessory, service, hap } = createHarness();
    new CountdownValveAccessory(hap.platform, accessory);

    expect(service.value(hap.Characteristic.Active)).toBe(hap.Characteristic.Active.INACTIVE);
    expect(service.value(hap.Characteristic.InUse)).toBe(hap.Characteristic.InUse.NOT_IN_USE);
    expect(service.value(hap.Characteristic.RemainingDuration)).toBe(0);
    expect(service.value(hap.Characteristic.SetDuration)).toBe(0);
  });

  it('publishes remaining and configured duration for an active schedule', () => {
    const { countdown, service, hap } = createHarness();

    countdown.update('2026-07-21T08:02:00.000Z', 120);

    expect(service.value(hap.Characteristic.Active)).toBe(hap.Characteristic.Active.ACTIVE);
    expect(service.value(hap.Characteristic.InUse)).toBe(hap.Characteristic.InUse.IN_USE);
    expect(service.value(hap.Characteristic.RemainingDuration)).toBe(120);
    expect(service.value(hap.Characteristic.SetDuration)).toBe(120);
  });

  it('refreshes remaining duration while a schedule is active', () => {
    const { countdown, service, hap } = createHarness();
    countdown.update('2026-07-21T08:02:00.000Z', 120);

    vi.advanceTimersByTime(30_000);

    expect(service.value(hap.Characteristic.RemainingDuration)).toBe(90);
    countdown.stop();
  });

  it('clears active state and duration when the schedule is removed', () => {
    const { countdown, service, hap } = createHarness();
    countdown.update('2026-07-21T08:02:00.000Z', 120);

    countdown.update(null, null);

    expect(service.value(hap.Characteristic.Active)).toBe(hap.Characteristic.Active.INACTIVE);
    expect(service.value(hap.Characteristic.InUse)).toBe(hap.Characteristic.InUse.NOT_IN_USE);
    expect(service.value(hap.Characteristic.RemainingDuration)).toBe(0);
    expect(service.value(hap.Characteristic.SetDuration)).toBe(0);
  });

  it('ignores HomeKit writes and republishes calculated state', async () => {
    const { countdown, service, hap } = createHarness();
    countdown.update('2026-07-21T08:02:00.000Z', 120);

    await service.set(hap.Characteristic.Active, hap.Characteristic.Active.INACTIVE);
    await service.set(hap.Characteristic.SetDuration, 30);

    expect(service.value(hap.Characteristic.Active)).toBe(hap.Characteristic.Active.ACTIVE);
    expect(service.value(hap.Characteristic.SetDuration)).toBe(120);
    countdown.stop();
  });
});

function createHarness() {
  const service = new FakeService();
  const hap = createFakeHap();
  const accessory = {
    displayName: 'Laundry Countdown',
    getService: vi.fn(() => undefined),
    addService: vi.fn(() => service),
  };
  const platform = { api: { hap } };
  const countdown = new CountdownValveAccessory(platform as never, accessory as never);

  return { accessory, countdown, service, hap: { ...hap, platform } };
}

function createFakeHap() {
  const Characteristic = {
    Name: characteristic('Name'),
    Active: characteristic('Active', { ACTIVE: 1, INACTIVE: 0 }),
    InUse: characteristic('InUse', { IN_USE: 1, NOT_IN_USE: 0 }),
    RemainingDuration: characteristic('RemainingDuration'),
    SetDuration: characteristic('SetDuration'),
    ValveType: characteristic('ValveType', { GENERIC_VALVE: 0 }),
  };

  return {
    Characteristic,
    Service: {
      Valve: 'Valve',
    },
  };
}

function characteristic(name: string, values: Record<string, number> = {}) {
  return { name, ...values };
}

class FakeService {
  private readonly values = new Map<object, unknown>();
  private readonly characteristics = new Map<object, FakeCharacteristic>();

  public setCharacteristic(characteristic: object, value: unknown): this {
    this.values.set(characteristic, value);
    return this;
  }

  public updateCharacteristic(characteristic: object, value: unknown): this {
    this.values.set(characteristic, value);
    return this;
  }

  public getCharacteristic(characteristic: object): FakeCharacteristic {
    let item = this.characteristics.get(characteristic);
    if (!item) {
      item = new FakeCharacteristic();
      this.characteristics.set(characteristic, item);
    }
    return item;
  }

  public value(characteristic: object): unknown {
    return this.values.get(characteristic);
  }

  public async set(characteristic: object, value: unknown): Promise<void> {
    await this.getCharacteristic(characteristic).write(value);
  }
}

class FakeCharacteristic {
  private setter: (() => void | Promise<void>) | undefined;

  public setProps(): this {
    return this;
  }

  public onGet(): this {
    return this;
  }

  public onSet(handler: () => void | Promise<void>): this {
    this.setter = handler;
    return this;
  }

  public async write(value: unknown): Promise<void> {
    void value;
    await this.setter?.();
  }
}
