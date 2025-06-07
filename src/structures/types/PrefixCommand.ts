import { PermissionFlagsBits } from "discord.js";
import { Runp } from "./Run";

export type PrefixCommand = {
    name: string;
    aliases: string[];
    cooldown?: {
        time: number;
        msg: string;
    };
    botpermission?: {
        permission: keyof typeof PermissionFlagsBits;
        msg: string;
    };
    allowIds?: {
        ids: string[];
        msg: string;
    };
    run: Runp
};