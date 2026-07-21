# Changelog

## 0.1.0-alpha.2

- Allow repeated alarms even when `motionDurationSeconds` is greater than or equal to `delaySeconds`.
- Force a clean OFF then ON motion update for overlapping repeated triggers and cancel the previous sensor reset timer before scheduling the next reset.

## 0.1.0-alpha.1

- Fixed configuration validation so one-shot alarms may use a motion duration longer than the delay.
- Kept the overlap guard for repeated alarms, where `delaySeconds` must remain greater than `motionDurationSeconds`.

## 0.1.0-alpha.0

- Initial implementation of the Persistent Alarm dynamic platform.
- Added persistent absolute-time schedules, repeat modes, restart recovery, HomeKit accessories, tests, documentation, workflows, and npm package verification.
