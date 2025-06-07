import { ApplicationCommandType, AutocompleteInteraction, ClientEvents, Message } from "discord.js";
import type { RType, SlashInteraction } from "#types";
import { type Client } from "undici-types";

export type Runs<K extends ApplicationCommandType> = (i: SlashInteraction[K], c?: Client) => any; // Run SlashCommand

export type Runp = (i: Message<true>, c?: Client, ...args: any[]) => any; // Run PrefixCommand

export type Rune<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => any; // Run Events

export type Runr<K extends keyof RType = keyof RType> = (i: RType[K]) => any; // Run Responders

export type Runa = (i: AutocompleteInteraction, focused: string) => any; // Run Autocomplete