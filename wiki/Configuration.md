# Configuration

Configure the `PersistentAlarm` platform with an `alarms` array. Each alarm needs `id`, `name`, `delay`, `motionDurationSeconds`, and `repeatMode`. The `delay` object uses separate `hours`, `minutes`, and `seconds` fields.

## Minimal example

This creates one alarm that fires once, 4 hours after the trigger switch is turned ON.

```json
{
  "platform": "PersistentAlarm",
  "name": "Persistent Alarm",
  "alarms": [
    {
      "id": "washing-machine",
      "name": "Washing Machine Reminder",
      "delay": {
        "hours": 4,
        "minutes": 0,
        "seconds": 0
      },
      "motionDurationSeconds": 10,
      "repeatMode": "once"
    }
  ]
}
```

## Duration examples

```json
{ "delay": { "hours": 4, "minutes": 0, "seconds": 0 } }
```

```json
{ "delay": { "hours": 0, "minutes": 30, "seconds": 0 } }
```

```json
{ "delay": { "hours": 0, "minutes": 0, "seconds": 45 } }
```

At least one of `hours`, `minutes`, or `seconds` must be greater than zero.

## Repeating example

This fires 3 times total: after 2 hours, 4 hours, and 6 hours.

```json
{
  "id": "dryer",
  "name": "Dryer Reminder",
  "delay": {
    "hours": 2,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 15,
  "repeatMode": "count",
  "repeatCount": 3
}
```

## Hide the reset switch

The reset logic still exists internally, but the HomeKit reset switch is not exposed.

```json
{
  "id": "water-heater",
  "name": "Water Heater Reminder",
  "delay": {
    "hours": 6,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "once",
  "homekitExposure": {
    "cancelSwitch": false,
    "remainingTime": false
  }
}
```

## Field reference

- `id`: stable internal ID. Do not change it when renaming the alarm.
- `name`: HomeKit display name prefix.
- `delay`: delay before the next trigger, split into hours, minutes, and seconds.
- `motionDurationSeconds`: how long the motion sensor stays active.
- `repeatMode`: `once`, `count`, or `infinite`.
- `repeatCount`: total number of triggers when `repeatMode` is `count`.
- `homekitExposure.cancelSwitch`: show or hide the optional reset switch.
- `homekitExposure.remainingTime`: show or hide the optional countdown accessory with HomeKit `Remaining Duration`.

## Francais

Configurez la plateforme `PersistentAlarm` avec un tableau `alarms`. Chaque alarme demande `id`, `name`, `delay`, `motionDurationSeconds` et `repeatMode`. L'objet `delay` utilise des champs separes `hours`, `minutes` et `seconds`.

## Exemple minimal

Cette configuration cree une alarme qui se declenche une fois, 4 heures apres l'activation du switch de declenchement.

```json
{
  "platform": "PersistentAlarm",
  "name": "Persistent Alarm",
  "alarms": [
    {
      "id": "washing-machine",
      "name": "Rappel Machine a laver",
      "delay": {
        "hours": 4,
        "minutes": 0,
        "seconds": 0
      },
      "motionDurationSeconds": 10,
      "repeatMode": "once"
    }
  ]
}
```

## Exemples de duree

```json
{ "delay": { "hours": 4, "minutes": 0, "seconds": 0 } }
```

```json
{ "delay": { "hours": 0, "minutes": 30, "seconds": 0 } }
```

```json
{ "delay": { "hours": 0, "minutes": 0, "seconds": 45 } }
```

Au moins un champ parmi `hours`, `minutes` ou `seconds` doit etre superieur a zero.

## Exemple avec repetition

Cette alarme se declenche 3 fois au total: apres 2 heures, 4 heures et 6 heures.

```json
{
  "id": "dryer",
  "name": "Rappel Seche-linge",
  "delay": {
    "hours": 2,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 15,
  "repeatMode": "count",
  "repeatCount": 3
}
```

## Masquer le switch reset

La logique reset existe toujours dans le plugin, mais le switch reset n'est pas expose dans HomeKit.

```json
{
  "id": "water-heater",
  "name": "Rappel Chauffe-eau",
  "delay": {
    "hours": 6,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "once",
  "homekitExposure": {
    "cancelSwitch": false,
    "remainingTime": false
  }
}
```

## Reference des champs

- `id`: ID interne stable. Ne le changez pas pour renommer l'alarme.
- `name`: prefixe du nom HomeKit.
- `delay`: delai avant le declenchement, separe en heures, minutes et secondes.
- `motionDurationSeconds`: duree pendant laquelle le detecteur reste actif.
- `repeatMode`: `once`, `count` ou `infinite`.
- `repeatCount`: nombre total de declenchements quand `repeatMode` vaut `count`.
- `homekitExposure.cancelSwitch`: affiche ou masque le switch reset optionnel.
- `homekitExposure.remainingTime`: affiche ou masque l'accessoire optionnel de compte a rebours avec `Remaining Duration` HomeKit.
