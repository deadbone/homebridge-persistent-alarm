# Repeat modes

`once` triggers once. `count` triggers `repeatCount` total times. `infinite` repeats until reset. Repeated schedules use `previousTriggerAt + delay`.

## Once

Use `once` for a single delayed event.

```json
{
  "repeatMode": "once"
}
```

The schedule clears after the first motion event.

## Fixed count

Use `count` when the alarm should stop by itself.

```json
{
  "delay": {
    "hours": 2,
    "minutes": 0,
    "seconds": 0
  },
  "repeatMode": "count",
  "repeatCount": 3
}
```

If triggered at 08:00, this fires at 10:00, 12:00, and 14:00.

## Infinite

Use `infinite` when the alarm should repeat until reset.

```json
{
  "delay": {
    "hours": 0,
    "minutes": 30,
    "seconds": 0
  },
  "repeatMode": "infinite"
}
```

Use the reset switch to stop future occurrences.

## Francais

`once` declenche une fois. `count` declenche `repeatCount` fois au total. `infinite` repete jusqu'au reset. La cadence utilise `previousTriggerAt + delay`.

## Une fois

Utilisez `once` pour un evenement unique differe.

```json
{
  "repeatMode": "once"
}
```

La programmation est effacee apres le premier evenement de mouvement.

## Nombre fixe

Utilisez `count` quand l'alarme doit s'arreter seule.

```json
{
  "delay": {
    "hours": 2,
    "minutes": 0,
    "seconds": 0
  },
  "repeatMode": "count",
  "repeatCount": 3
}
```

Si elle est declenchee a 08:00, elle sonne a 10:00, 12:00 et 14:00.

## Infini

Utilisez `infinite` quand l'alarme doit repeter jusqu'au reset.

```json
{
  "delay": {
    "hours": 0,
    "minutes": 30,
    "seconds": 0
  },
  "repeatMode": "infinite"
}
```

Utilisez le switch reset pour arreter les occurrences futures.
