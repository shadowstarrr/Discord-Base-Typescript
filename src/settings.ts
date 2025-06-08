import { Settings } from "#types";

export const settings: Settings = {
    terminal: 'informativo',
    terminalinfo: {
        showSlashCommandsFiles: false, // opcional
        showSlashCommandsRegistred: true, // opcional

        showPrefixCommandsFiles: true, // opcional
        showPrefixCommandsRegistred: true, // opcional

        showEventsFiles: false, // opcional
        showEventsRegistred: true, // opcional

        showResponderFiles: false, // opcional
        showResponderRegistred: true // opcional
    },
    bot: {
        BotToken: '', // Obrigatorio
        prefix: '.', // opcional
        guilds: [], // opcional
        WebhookError: '' // opcional
    }
}