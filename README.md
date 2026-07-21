<p align="center">
  <img src="assets/plugin-icon.png" alt="Persistent Alarm icon" width="128" height="128">
</p>

# Homebridge Persistent Alarm

## Overview

Homebridge Persistent Alarm creates HomeKit alarms that are scheduled from an absolute persisted date. A trigger switch starts or replaces a schedule, a motion sensor fires when the schedule is reached, and an optional cancel/reset switch is the only HomeKit control that cancels it.

## Features

- Multiple independent alarms in one dynamic platform.
- Persistent `triggerAt` dates restored after Homebridge, HomeKit, Home hub, or Apple Home restarts.
- Repeat modes: once, fixed count, and until cancelled.
- Stable cadence based on the previous theoretical trigger time.
- Mandatory trigger switch and motion sensor, optional cancel/reset switch.
- Stable UUIDs based on the alarm ID and accessory role.
- No telemetry.

## Compatibility

- Homebridge: `^1.6.0 || ^2.0.0`
- Node.js: `^22.12.0 || ^24.0.0`

## Installation

Install the plugin, add the `PersistentAlarm` platform, then create one or more alarms.

## Homebridge UI installation

Search for `homebridge-persistent-alarm` in Homebridge UI and install it. The plugin provides `config.schema.json` for guided configuration.

## npm installation

```sh
npm install -g homebridge-persistent-alarm
```

## Local development installation

```sh
npm install
npm run build
npm link
```

## Homebridge UI configuration

Each alarm needs a stable `id`, a HomeKit `name`, `delay`, `motionDurationSeconds`, and `repeatMode`.

Duration fields are split for easier Homebridge UI entry:

```json
{
  "delay": {
    "hours": 4,
    "minutes": 0,
    "seconds": 0
  }
}
```

## Example configuration

```json
{
  "platform": "PersistentAlarm",
  "name": "Persistent Alarm",
  "debug": false,
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
      "repeatMode": "count",
      "repeatCount": 3,
      "homekitExposure": {
        "cancelSwitch": true
      }
    }
  ]
}
```

## HomeKit accessories

For each alarm, the plugin exposes a trigger switch, a motion sensor, and by default a cancel/reset switch. The trigger switch is a momentary button. It is not an armed-state indicator.

## Nicolas baseline behavior

If the delay is 4 hours and the user turns the trigger switch ON at 08:32, the plugin stores an absolute trigger date for 12:32. The trigger switch returning OFF, either automatically or manually, does not cancel the alarm. Only the cancel/reset switch cancels the alarm.

## Persistent scheduling

The persisted state stores ISO dates, repeat settings captured when the schedule was created, and completed trigger counts. Running schedules keep their captured delay and repeat mode. New trigger switch activations use the current configuration.

## Restart recovery

Future triggers are restored from persisted absolute dates. If the motion sensor was active before shutdown and `sensorActiveUntil` is still in the future, the sensor is restored to Motion Detected until that date.

## Missed triggers

If a scheduled time passed while Homebridge was offline, the plugin emits at most one immediate motion event at startup, advances the completed trigger count using the theoretical cadence, and schedules the next theoretical trigger if the repeat mode still allows one.

## Repeat modes

- `once`: trigger once and stop.
- `count`: trigger `repeatCount` total times, including the first one.
- `infinite`: repeat until cancel/reset is used.

## Cancel and reset

The cancel/reset switch cancels the next trigger, stops repetitions, clears active motion, removes persisted dates, and resets completed triggers to `0`. Hiding this accessory does not remove the internal reset logic.

## HomeKit exposure

`homekitExposure.cancelSwitch` controls whether the cancel/reset switch is visible. The trigger switch and motion sensor cannot be hidden.

## UUID stability and renaming

Accessory UUIDs are based on a plugin namespace, alarm ID, and role. Renaming an alarm or reordering alarms does not recreate HomeKit accessories. Changing the stable `id` intentionally creates new accessories and state.

## Automation examples

- Start a washing machine reminder by turning the trigger switch ON.
- Run a HomeKit automation when the motion sensor detects motion.
- Cancel a pending reminder by turning the reset switch ON.

Example: a 30 minute repeating reminder until reset:

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

## Troubleshooting

If an alarm does not fire, check that the alarm ID is unique, `delay` is greater than zero, and Homebridge has write access to its persistence directory. Enable `debug` for more operational logs.

## Security and privacy

The plugin stores only alarm IDs, ISO dates, repeat settings, and counters. It does not store secrets, call external services, or collect telemetry.

## Development

```sh
npm install
npm run lint
npm run build
```

## Testing

```sh
npm test
npm run verify:pack
```

## Publishing

Stable publishing is tag-based and uses npm Trusted Publishing through GitHub Actions. Do not publish stable releases without an explicit release decision.

## Beta versions

Pull requests from the same repository may publish beta builds with the `beta` dist-tag:

```sh
npm install -g homebridge-persistent-alarm@beta
```

## Scoped Homebridge plugin compatibility

The UUID namespace is stable so a future documented migration to `@homebridge-plugins/homebridge-persistent-alarm` can preserve HomeKit accessories.

## Future Homebridge verification

This plugin does not claim verified Homebridge status. Add verified badges only after official verification is granted.

# Homebridge Persistent Alarm - Francais

## Presentation

Homebridge Persistent Alarm cree des alarmes HomeKit programmees avec une date absolue persistante. Un interrupteur declenche ou remplace une programmation, un detecteur de mouvement se declenche a l'heure prevue, et l'interrupteur optionnel d'annulation/reinitialisation est le seul controle HomeKit qui annule l'alarme.

## Fonctionnalites

- Plusieurs alarmes independantes dans une meme plateforme dynamique.
- Dates `triggerAt` persistantes restaurees apres redemarrage de Homebridge, HomeKit, du concentrateur Home ou de l'app Maison.
- Modes de repetition: une fois, nombre fixe, jusqu'a annulation.
- Cadence stable basee sur l'heure theorique precedente.
- Interrupteur de declenchement et detecteur de mouvement obligatoires, interrupteur reset optionnel.
- UUID stables bases sur l'ID d'alarme et le role de l'accessoire.
- Aucune telemetrie.

## Compatibilite

- Homebridge: `^1.6.0 || ^2.0.0`
- Node.js: `^22.12.0 || ^24.0.0`

## Installation

Installez le plugin, ajoutez la plateforme `PersistentAlarm`, puis creez une ou plusieurs alarmes.

## Installation avec Homebridge UI

Cherchez `homebridge-persistent-alarm` dans Homebridge UI. Le fichier `config.schema.json` fournit la configuration guidee.

## Installation npm

```sh
npm install -g homebridge-persistent-alarm
```

## Installation locale de developpement

```sh
npm install
npm run build
npm link
```

## Configuration Homebridge UI

Chaque alarme demande un `id` stable, un `name`, `delay`, `motionDurationSeconds` et `repeatMode`.

Les champs de duree sont separes pour faciliter la saisie dans Homebridge UI:

```json
{
  "delay": {
    "hours": 4,
    "minutes": 0,
    "seconds": 0
  }
}
```

## Exemple de configuration

Voir l'exemple JSON de la section anglaise; les noms peuvent etre adaptes.

## Accessoires HomeKit

Chaque alarme expose un interrupteur de declenchement, un detecteur de mouvement et, par defaut, un interrupteur d'annulation/reinitialisation. L'interrupteur de declenchement est un bouton momentane. Ce n'est pas un indicateur d'armement.

## Comportement de base demande par Nicolas

Avec un delai de 4 heures, si l'utilisateur active l'interrupteur a 08:32, le plugin stocke une date absolue pour 12:32. Le retour de l'interrupteur a OFF, automatique ou manuel, n'annule pas l'alarme. Seul l'interrupteur d'annulation/reinitialisation l'annule.

## Programmation persistante

L'etat persistant contient des dates ISO, les parametres de repetition captures au moment de la programmation, et le nombre de declenchements termines. Une programmation en cours conserve ses parametres captures.

## Recuperation apres redemarrage

Les declenchements futurs sont restaures depuis les dates absolues. Si le detecteur etait actif et que `sensorActiveUntil` est encore dans le futur, il revient immediatement a Motion Detected jusqu'a cette date.

## Declenchements manques

Si une heure programmee est passee pendant un arret, le plugin emet au maximum un evenement Motion immediat au demarrage, avance les compteurs selon la cadence theorique, puis programme la prochaine occurrence s'il en reste.

## Modes de repetition

- `once`: un seul declenchement.
- `count`: `repeatCount` declenchements au total.
- `infinite`: repetition jusqu'a annulation.

## Annulation et reinitialisation

Le switch reset annule le prochain declenchement, stoppe les repetitions, remet le detecteur a inactif, efface les dates persistantes et remet le compteur a `0`.

## Exposition HomeKit

`homekitExposure.cancelSwitch` permet de masquer le switch reset. L'interrupteur de declenchement et le detecteur de mouvement ne peuvent pas etre masques.

## Stabilite des UUID et renommage

Les UUID dependent d'un namespace du plugin, de l'ID stable et du role. Renommer une alarme ou changer l'ordre ne recree pas les accessoires.

## Exemples d'automatisations

- Lancer un rappel de machine a laver via le switch de declenchement.
- Declencher une automatisation HomeKit quand le detecteur passe a Motion Detected.
- Annuler un rappel avec le switch reset.

Exemple: un rappel toutes les 30 minutes jusqu'au reset:

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

## Depannage

Verifiez que l'ID est unique, que `delay` est superieur a zero, et que Homebridge peut ecrire dans son repertoire de persistance. Activez `debug` pour plus de logs.

## Securite et confidentialite

Le plugin stocke seulement des IDs d'alarme, dates ISO, parametres de repetition et compteurs. Il n'appelle aucun service externe et ne collecte pas de telemetrie.

## Developpement

```sh
npm install
npm run lint
npm run build
```

## Tests

```sh
npm test
npm run verify:pack
```

## Publication

La publication stable se fait par tag et npm Trusted Publishing. Ne publiez pas de version stable sans decision explicite.

## Versions beta

Les pull requests du meme depot peuvent publier des betas sous le dist-tag `beta`.

## Compatibilite avec les plugins Homebridge scopes

Le namespace UUID est stable pour permettre une future migration documentee vers `@homebridge-plugins/homebridge-persistent-alarm`.

## Future verification Homebridge

Ce plugin ne revendique pas le statut verifie Homebridge tant qu'il n'a pas ete accorde officiellement.
