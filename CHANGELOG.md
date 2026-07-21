# Changelog

## 0.1.0-alpha.1

- Fixed configuration validation so one-shot alarms may use a motion duration longer than the delay.
- Kept the overlap guard for repeated alarms, where `delaySeconds` must remain greater than `motionDurationSeconds`.

## 0.1.0-alpha.0

- Initial implementation of the Persistent Alarm dynamic platform.
- Added persistent absolute-time schedules, repeat modes, restart recovery, HomeKit accessories, tests, documentation, workflows, and npm package verification.
