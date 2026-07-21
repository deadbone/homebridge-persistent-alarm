# HomeKit accessories

Each alarm has a trigger switch, motion sensor, and optional reset switch. The trigger switch is not an armed-state indicator.

## Trigger switch

The trigger switch is a momentary button.

When it turns ON:

- the plugin calculates an absolute `triggerAt` date;
- any existing schedule for the same alarm is replaced;
- repeat counters are reset;
- the switch returns OFF automatically.

Turning the trigger switch OFF does not cancel anything. This is the most important behavior of the plugin.

## Motion sensor

The motion sensor is the event source for HomeKit automations.

At each scheduled trigger:

- Motion turns ON;
- the plugin stores `sensorActiveUntil`;
- Motion turns OFF after `motionDurationSeconds`.

If another trigger happens while Motion is already active, the plugin forces an OFF then ON update so HomeKit can see a clean new event.

## Reset switch

The reset switch cancels the stored schedule, stops future repeats, clears active motion, and resets counters. It is exposed by default and can be hidden with `homekitExposure.cancelSwitch`.

## Example accessory names

For an alarm named `Washing Machine Reminder`, HomeKit accessories are named:

- `Washing Machine Reminder Trigger`
- `Washing Machine Reminder Motion`
- `Washing Machine Reminder Reset`

## Francais

Chaque alarme a un switch de declenchement, un detecteur de mouvement et un switch reset optionnel. Le switch de declenchement n'est pas un indicateur d'armement.

## Switch de declenchement

Le switch de declenchement est un bouton momentane.

Quand il passe a ON:

- le plugin calcule une date absolue `triggerAt`;
- toute programmation existante pour cette alarme est remplacee;
- les compteurs de repetition sont remis a zero;
- le switch revient automatiquement a OFF.

Passer le switch de declenchement a OFF n'annule rien. C'est le comportement le plus important du plugin.

## Detecteur de mouvement

Le detecteur de mouvement est la source d'evenement pour les automatisations HomeKit.

A chaque declenchement programme:

- Motion passe a ON;
- le plugin stocke `sensorActiveUntil`;
- Motion repasse a OFF apres `motionDurationSeconds`.

Si un nouveau declenchement arrive alors que Motion est deja actif, le plugin force une mise a jour OFF puis ON pour que HomeKit voie un nouvel evenement propre.

## Switch reset

Le switch reset annule la programmation stockee, arrete les repetitions futures, efface le mouvement actif et remet les compteurs a zero. Il est expose par defaut et peut etre masque avec `homekitExposure.cancelSwitch`.

## Exemple de noms d'accessoires

Pour une alarme nommee `Rappel Machine a laver`, HomeKit affichera:

- `Rappel Machine a laver Trigger`
- `Rappel Machine a laver Motion`
- `Rappel Machine a laver Reset`
