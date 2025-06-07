# Discord.js v14 Typescript Base

## Requisitos 🖥️

* [Bun](https://bun.sh)

## Configurando
* 1 - Edite o ./src/settings.ts
* 2 - Rode
```
bun dev
```

## Templates

## Aviso! ⚠️

Use as variaveis como são mostradas no template

##

### SlashCommands
```
import { SlashCommand } from "#main";

export const command: SlashCommand = {
    name: 'test',
    description: 'test command',
    type: 'ChatInput', // Lembre de passar type para o run funcionar!
    /* 
    If you wanna autocomplete
    autocomplete: (i, focused) => {

    },
    */

    run: (i, c) => {
        i.reply('Test!');
    }
};
```

### PrefixCommands

```
import { PrefixCommand } from "#main";

export const command: PrefixCommand = {
    name: 'test',
    aliases: ['t'],

    run: (m, c, args) => {
        m.reply('Test command!');
    }
};
```

### Events

```
import { Event } from "#main";

export const event: Event = {
    name: 'ready',
    run: () => {} // Ja vem tipado os argumentos
};
```

### Responders

```
import { Responder } from "#main";

export const responder: Responder = {
    customId: 'teste',
    type: 'button',
    run: (i) => {
        i.reply('oi')
    }
};
```