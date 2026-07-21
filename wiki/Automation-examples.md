# Automation examples

Turn the trigger switch ON when a task starts, then use the motion sensor as the HomeKit automation event later.

## Washing machine reminder

Goal: receive a HomeKit event 4 hours after starting the washing machine.

Configuration:

```json
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
```

HomeKit flow:

1. When the washing machine starts, turn `Washing Machine Reminder Trigger` ON.
2. The trigger switch returns OFF automatically.
3. Four hours later, `Washing Machine Reminder Motion` turns ON.
4. Use that motion event to send a notification, flash a light, or speak on a speaker.

## Repeating reminder

Goal: remind every 30 minutes until someone resets the alarm.

Configuration:

```json
{
  "id": "laundry-repeat",
  "name": "Laundry Repeat Reminder",
  "delay": {
    "hours": 0,
    "minutes": 30,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "infinite"
}
```

Use `Laundry Repeat Reminder Reset` to stop future reminders.

## Limited repeat reminder

Goal: remind 3 times and then stop.

```json
{
  "id": "dishwasher",
  "name": "Dishwasher Reminder",
  "delay": {
    "hours": 1,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "count",
  "repeatCount": 3
}
```

This produces at most 3 HomeKit motion events after the trigger switch is used.

## Francais

Activez le switch de declenchement au debut d'une tache, puis utilisez le detecteur comme evenement HomeKit plus tard.

## Rappel machine a laver

Objectif: recevoir un evenement HomeKit 4 heures apres le lancement de la machine.

Configuration:

```json
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
```

Flux HomeKit:

1. Au lancement de la machine, activez `Rappel Machine a laver Trigger`.
2. Le switch de declenchement revient automatiquement a OFF.
3. Quatre heures plus tard, `Rappel Machine a laver Motion` passe a ON.
4. Utilisez cet evenement pour envoyer une notification, allumer une lampe ou parler sur une enceinte.

## Rappel repetitif

Objectif: rappeler toutes les 30 minutes jusqu'a reset.

```json
{
  "id": "laundry-repeat",
  "name": "Rappel Linge",
  "delay": {
    "hours": 0,
    "minutes": 30,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "infinite"
}
```

Utilisez `Rappel Linge Reset` pour arreter les prochains rappels.

## Rappel avec nombre limite

Objectif: rappeler 3 fois puis s'arreter.

```json
{
  "id": "dishwasher",
  "name": "Rappel Lave-vaisselle",
  "delay": {
    "hours": 1,
    "minutes": 0,
    "seconds": 0
  },
  "motionDurationSeconds": 10,
  "repeatMode": "count",
  "repeatCount": 3
}
```

Cela produit au maximum 3 evenements de mouvement apres l'utilisation du switch de declenchement.
