# homebridge-persistent-alarm Wiki

## English

Welcome to the `homebridge-persistent-alarm` wiki.

This Homebridge plugin provides persistent absolute-time HomeKit alarms. A trigger switch creates or replaces a schedule, a motion sensor fires when the schedule is reached, and an optional cancel/reset switch is the only HomeKit control that cancels it.

### Pages

- [Installation](Installation.md)
- [Configuration](Configuration.md)
- [HomeKit accessories](HomeKit-accessories.md)
- [Persistent scheduling](Persistent-scheduling.md)
- [Restart recovery](Restart-recovery.md)
- [Missed triggers](Missed-triggers.md)
- [Repeat modes](Repeat-modes.md)
- [Automation examples](Automation-examples.md)
- [Troubleshooting](Troubleshooting.md)
- [Security and privacy](Security-and-privacy.md)
- [Development](Development.md)

### Compatibility

- Homebridge `^1.6.0 || ^2.0.0`.
- Node.js `^22.12.0 || ^24.0.0`.
- Plugin type: dynamic platform.
- Module format: ESM.

### Scope

The plugin focuses on schedules that survive Homebridge, HomeKit, Home hub, and Apple Home restarts. Turning the trigger switch OFF never cancels a pending schedule; use the cancel/reset switch for that action.

### Scoped plugin readiness

The current npm package is `homebridge-persistent-alarm`.

If the Homebridge team later accepts the plugin into the scoped plugin program, the scoped package would be `@homebridge-plugins/homebridge-persistent-alarm`. The plugin keeps a stable HomeKit accessory UUID namespace so this future migration can preserve existing HomeKit accessories when the Homebridge scoped-plugin migration process is followed.

### Support

If this plugin is useful to you, you can support its maintenance through [GitHub Sponsors](https://github.com/sponsors/deadbone) or [Ko-fi](https://ko-fi.com/deadbone111019).

## Francais

Bienvenue dans le wiki de `homebridge-persistent-alarm`.

Ce plugin Homebridge fournit des alarmes HomeKit persistantes basees sur des dates absolues. Un interrupteur de declenchement cree ou remplace une programmation, un detecteur de mouvement se declenche a l'heure prevue, et l'interrupteur optionnel d'annulation/reinitialisation est le seul controle HomeKit qui annule l'alarme.

### Pages

- [Installation](Installation.md)
- [Configuration](Configuration.md)
- [Accessoires HomeKit](HomeKit-accessories.md)
- [Programmation persistante](Persistent-scheduling.md)
- [Recuperation apres redemarrage](Restart-recovery.md)
- [Declenchements manques](Missed-triggers.md)
- [Modes de repetition](Repeat-modes.md)
- [Exemples d'automatisations](Automation-examples.md)
- [Depannage](Troubleshooting.md)
- [Securite et confidentialite](Security-and-privacy.md)
- [Developpement](Development.md)

### Compatibilite

- Homebridge `^1.6.0 || ^2.0.0`.
- Node.js `^22.12.0 || ^24.0.0`.
- Type de plugin : plateforme dynamique.
- Format de module : ESM.

### Perimetre

Le plugin se concentre sur des programmations qui survivent aux redemarrages de Homebridge, HomeKit, du concentrateur Home et de l'app Maison. Le retour a OFF de l'interrupteur de declenchement n'annule jamais une programmation en attente ; utilisez l'interrupteur d'annulation/reinitialisation pour cette action.

### Preparation aux plugins scopes

Le paquet npm actuel est `homebridge-persistent-alarm`.

Si l'equipe Homebridge accepte plus tard le plugin dans le programme des plugins scopes, le paquet scope serait `@homebridge-plugins/homebridge-persistent-alarm`. Le plugin conserve un namespace UUID HomeKit stable afin que cette future migration puisse preserver les accessoires HomeKit existants lorsque la procedure de migration scoped de Homebridge est respectee.

### Soutenir

Si ce plugin vous est utile, vous pouvez soutenir sa maintenance via [GitHub Sponsors](https://github.com/sponsors/deadbone) ou [Ko-fi](https://ko-fi.com/deadbone111019).
