import { ClientEvents } from "discord.js";
import { Rune } from "./Run";

type BaseEvent<K extends keyof ClientEvents> = {
  name: K;
  once?: boolean;
  run: Rune<K>;
};

export type Event = {
  [K in keyof ClientEvents]: BaseEvent<K>;
}[keyof ClientEvents];