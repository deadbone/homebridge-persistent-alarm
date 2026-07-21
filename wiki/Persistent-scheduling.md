# Persistent scheduling

The persisted file stores `schemaVersion`, absolute ISO dates, schedule delay, repeat mode, repeat count, and completed triggers per stable alarm ID.

## What is persisted

Example conceptual state:

```json
{
  "schemaVersion": 1,
  "alarms": {
    "washing-machine": {
      "triggerAt": "2026-07-21T12:32:00.000Z",
      "sensorActiveUntil": null,
      "scheduleDelaySeconds": 14400,
      "repeatMode": "count",
      "repeatCount": 3,
      "completedTriggers": 1
    }
  }
}
```

The trigger switch state is not the source of truth. The persisted `triggerAt` date is.

## Configuration changes

When the trigger switch creates a schedule, the current delay and repeat settings are captured in persistent state. Later configuration changes affect new trigger activations, not the already stored schedule.

## Renaming

You can rename an alarm by changing `name`. Keep the same `id` to preserve HomeKit accessories and persistent state.

## Francais

Le fichier persistant stocke `schemaVersion`, dates ISO absolues, delai capture, mode de repetition, nombre de repetitions et compteur par ID stable.

## Ce qui est persiste

Exemple conceptuel d'etat:

```json
{
  "schemaVersion": 1,
  "alarms": {
    "washing-machine": {
      "triggerAt": "2026-07-21T12:32:00.000Z",
      "sensorActiveUntil": null,
      "scheduleDelaySeconds": 14400,
      "repeatMode": "count",
      "repeatCount": 3,
      "completedTriggers": 1
    }
  }
}
```

L'etat du switch de declenchement n'est pas la source de verite. La date persistante `triggerAt` l'est.

## Changements de configuration

Quand le switch de declenchement cree une programmation, le delai et les parametres de repetition courants sont captures dans l'etat persistant. Les changements de configuration suivants affectent les nouvelles activations, pas la programmation deja stockee.

## Renommage

Vous pouvez renommer une alarme en changeant `name`. Gardez le meme `id` pour conserver les accessoires HomeKit et l'etat persistant.
