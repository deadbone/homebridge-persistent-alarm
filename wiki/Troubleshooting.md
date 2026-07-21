# Troubleshooting

Check unique IDs, valid repeat mode, positive durations, and a `delay` greater than zero. Enable `debug` for operational logs.

## Child bridge fails to start

Check the Homebridge log for `Invalid PersistentAlarm configuration`. Common causes:

- duplicate `id` values;
- missing `delay`;
- `delay` set to all zeros;
- unsupported `repeatMode`;
- `repeatMode: "count"` with `repeatCount` missing or lower than 1.

Example valid delay:

```json
{
  "delay": {
    "hours": 0,
    "minutes": 5,
    "seconds": 0
  }
}
```

## Trigger switch turns OFF immediately

This is expected. The trigger switch is momentary. OFF does not mean the alarm was cancelled.

## Alarm does not cancel when trigger is turned OFF

This is also expected. Use the reset switch to cancel a pending alarm.

## I renamed an alarm and HomeKit kept the same accessory

That is expected when the `id` did not change. The `id` controls UUID stability; `name` controls display text.

## I need to test quickly

Use a short delay:

```json
{
  "delay": {
    "hours": 0,
    "minutes": 0,
    "seconds": 15
  },
  "motionDurationSeconds": 5,
  "repeatMode": "once"
}
```

## Francais

Verifiez les IDs uniques, le mode de repetition, les durees positives et un `delay` superieur a zero. Activez `debug` pour plus de logs.

## Le child bridge ne demarre pas

Regardez le log Homebridge pour `Invalid PersistentAlarm configuration`. Causes frequentes:

- valeurs `id` en double;
- `delay` manquant;
- `delay` avec toutes les valeurs a zero;
- `repeatMode` non supporte;
- `repeatMode: "count"` avec `repeatCount` manquant ou inferieur a 1.

Exemple de delai valide:

```json
{
  "delay": {
    "hours": 0,
    "minutes": 5,
    "seconds": 0
  }
}
```

## Le switch de declenchement repasse OFF immediatement

C'est normal. Le switch de declenchement est momentane. OFF ne signifie pas que l'alarme est annulee.

## L'alarme ne s'annule pas quand le trigger passe OFF

C'est normal aussi. Utilisez le switch reset pour annuler une alarme en attente.

## J'ai renomme une alarme et HomeKit garde le meme accessoire

C'est attendu si `id` n'a pas change. `id` controle la stabilite des UUID; `name` controle le texte affiche.

## Tester rapidement

Utilisez un delai court:

```json
{
  "delay": {
    "hours": 0,
    "minutes": 0,
    "seconds": 15
  },
  "motionDurationSeconds": 5,
  "repeatMode": "once"
}
```
