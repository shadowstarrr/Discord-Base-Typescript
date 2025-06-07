import {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ModalMessageModalSubmitInteraction,
  ModalSubmitInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import { Runr } from "./Run";

export interface RType {
  button: ButtonInteraction;
  stringselect: StringSelectMenuInteraction;
  channelselect: ChannelSelectMenuInteraction;
  roleselect: RoleSelectMenuInteraction;
  userselect: UserSelectMenuInteraction;
  modal: ModalSubmitInteraction & ModalMessageModalSubmitInteraction;
}

export type Responder<K extends keyof RType = keyof RType> = {
  [P in K]: {
    customId: string;
    type: P;
    run: Runr<P>;
  };
}[K];