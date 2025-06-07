import { Interaction } from "discord.js";

export async function GetInteraction(i: Interaction) {
  if (i.isButton()) return "button";
  if (i.isStringSelectMenu()) return "stringselect";
  if (i.isChannelSelectMenu()) return "channelselect";
  if (i.isRoleSelectMenu()) return "roleselect";
  if (i.isUserSelectMenu()) return "userselect";
  if (i.isModalSubmit()) return "modal";
}
