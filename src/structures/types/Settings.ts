export interface Settings {
  terminal: "minimalista" | "informativo";
  terminalinfo?: {
    showSlashCommandsRegistred?: boolean | true;
    showSlashCommandsFiles?: boolean | true;

    showPrefixCommandsRegistred?: boolean | true;
    showPrefixCommandsFiles?: boolean | true; 

    showEventsFiles?: boolean | true;
    showEventsRegistred?: boolean | true;

    showResponderFiles?: boolean | true;
    showResponderRegistred?: boolean | true;
  };
  bot: {
    BotToken: string;
    prefix?: string;
    guilds?: string[] | [];
    WebhookError?: string;
  }
}
