import {
  APIApplicationCommandOption,
  ApplicationCommandType,
  ApplicationIntegrationType,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Locale,
  MessageContextMenuCommandInteraction,
  type PermissionFlagsBits,
  PermissionResolvable,
  UserContextMenuCommandInteraction,
} from "discord.js";
import { Runa, Runs } from "./Run";

export type SlashInteraction = {
  [ApplicationCommandType.ChatInput]: ChatInputCommandInteraction;
  [ApplicationCommandType.User]: UserContextMenuCommandInteraction;
  [ApplicationCommandType.Message]: MessageContextMenuCommandInteraction;
  [ApplicationCommandType.PrimaryEntryPoint]: ContextMenuCommandInteraction;
};


export type SlashCommand<K extends keyof typeof ApplicationCommandType = keyof typeof ApplicationCommandType> = {
[P in K]: {
    name: string;
    description: string;
    type: P
    defaultMemberPermission?: PermissionResolvable | null;
    dmPermission?: boolean | undefined;
    integrationTypes?: ApplicationIntegrationType[] | [];
    nameLocalizations?: Partial<Record<Locale, string | null>>;
    descriptionLocalizations?: Partial<Record<Locale, string | null>>;
    nsfw?: boolean | false;
    cooldown?: {
      time: number;
      msg: string;
    } | null;
    botpermission?: {
      permission: keyof typeof PermissionFlagsBits;
      msg: string;
    } | null;
    allowIds?: {
      ids: string[];
      msg: string;
    } | null;
    options?: APIApplicationCommandOption[];

    autocomplete?: Runa;
    run: Runs<typeof ApplicationCommandType[P]>;
}
}[K];
