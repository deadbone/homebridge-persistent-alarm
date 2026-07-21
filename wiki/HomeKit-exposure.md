# HomeKit exposure

Use `homekitExposure.cancelSwitch` to hide or expose the reset switch. Use `homekitExposure.remainingTime` to hide or expose the optional countdown accessory. Trigger and motion accessories are mandatory.

The countdown accessory uses a HomeKit valve service so compatible apps can display `Remaining Duration` for the active schedule. It is status-only: changing its Active or Set Duration controls in HomeKit does not start, cancel, or reschedule the alarm.

## Francais

Utilisez `homekitExposure.cancelSwitch` pour masquer ou afficher le reset. Utilisez `homekitExposure.remainingTime` pour masquer ou afficher l'accessoire optionnel de compte a rebours. Le trigger et le detecteur sont obligatoires.

L'accessoire de compte a rebours utilise un service HomeKit de type valve afin que les apps compatibles puissent afficher `Remaining Duration` pour la programmation active. Il est informatif uniquement: modifier ses controles Active ou Set Duration dans HomeKit ne demarre pas, n'annule pas et ne reprogramme pas l'alarme.
