import { Client, EmbedBuilder, GatewayIntentBits, Partials, WebhookClient } from "discord.js";
import { pathToFileURL } from "node:url";
import { logger } from "#functions";
import path from "node:path";
import { glob } from "glob";
import { settings } from "../settings";
import ck from "chalk";
import { GetInteraction } from "#utils";
import { PrefixCommand, SlashCommand } from "#types";

export class ExtendedClient extends Client {
  public cooldowns: Map<string, number> = new Map();

  constructor() {
    super({
      intents: Object.values(GatewayIntentBits) as [],
      partials: Object.values(Partials) as [],
    });
  }

  private async LoadSlashCommands() {
    try {
      const commandF = await glob(`./src/commands/**/*.ts`, {});
      const comandos = await Promise.all(
        commandF.map(async (arquivo) => {
          const url = pathToFileURL(path.resolve(arquivo)).href;
          const modulo = await import(url);

          return {
            command: modulo.command as SlashCommand,
          };
        })
      );

      const cmdsLoaded = comandos
        .filter(
          (cmd) =>
            cmd.command.name && cmd.command.description && cmd.command.run
        )
        .map((cmd) => ({
          name: cmd.command.name,
          description: cmd.command.description,
          dmPermission: cmd.command.dmPermission,

          defaultMemberPermissions: cmd.command.defaultMemberPermission,

          descriptionLocalizations: cmd.command.descriptionLocalizations,
          nameLocalizations: cmd.command.nameLocalizations,

          integrationTypes: cmd.command.integrationTypes,
          nsfw: cmd.command.nsfw,
          options: cmd.command.options,
        }));

      if (settings?.terminalinfo?.showSlashCommandsFiles) {
        if (cmdsLoaded.length > 0) {
          cmdsLoaded.forEach((cmd) => {
            logger.success(
              `${ck.hex("#98D7C2").bold(`/${cmd.name}`)} ${ck
                .hex("#FFFF00")
                .bold("Carregado")}`
            );
          });
        }
      }

      if (Array(settings.bot?.guilds).length > 0) {
        for (
          let index = 0;
          index < Array(settings?.bot?.guilds).length;
          index++
        ) {
          const element = Array(settings.bot?.guilds)[index];

          const guild = this.application?.client.guilds.cache.get(`${element}`);

          if (!guild) {
            logger.error("Guild not founded");
            return;
          }

          await guild.commands.set(cmdsLoaded);
        }
      } else {
        this.application?.commands.set(cmdsLoaded); // --> Eu sei que demora mais, porem e mais otimizado do que sincronizar uma por uma...
      }

      this.on("interactionCreate", (i) => {
        if (i.isAutocomplete()) {
          const focused = i.options.getFocused();
          const cmd = comandos.find((c) => c.command.name === i.commandName);

          if (!cmd || !cmd.command.autocomplete) return;

          cmd?.command?.autocomplete(i, focused);
        };
        if (!i.isCommand()) return;
        const cmd = comandos.find((c) => c.command.name === i.commandName);


        const now = Date.now();

        if (!cmd) return;

        if (
          cmd.command.allowIds &&
          !cmd.command.allowIds.ids.includes(i.user.id)
        ) {
          i.reply({
            flags: "Ephemeral",
            content: cmd.command.allowIds.msg.replace(
              "{user}",
              `<@${i.user.id}>`
            ),
          });
          return;
        }

        if (
          cmd.command.botpermission &&
          (!i.guild ||
            !i.guild.members.me?.permissions.has(
              cmd.command.botpermission.permission
            ))
        ) {
          i.reply({
            flags: "Ephemeral",
            content: cmd.command.botpermission.msg.replace(
              "{permissionpending}",
              `${cmd.command.botpermission.permission}`
            ),
          });
          return;
        }

        if (cmd.command.cooldown) {
          if (this.cooldowns.has(i.user.id)) {
            if (
              now - this.cooldowns.get(i.user.id)! <
              cmd.command.cooldown.time
            ) {
              i.reply({
                content: cmd.command.cooldown.msg.replace(
                  "{timeleft}",
                  `<t:${Math.floor(
                    (this.cooldowns.get(i.user.id)! +
                      cmd.command.cooldown.time) /
                      1000
                  )}:R>`
                ),
                flags: "Ephemeral",
              });
              return;
            }
          }

          this.cooldowns.set(i.user.id, now);
          setTimeout(
            () => this.cooldowns.delete(i.user.id),
            cmd.command.cooldown.time
          );
        }

      try {
        cmd.command.run(i as never, i.client as never);
      } catch (err) {
        logger.error(err);
      };
      });

      return cmdsLoaded;
    } catch (err) {
      if (!(err instanceof Error)) return;
      if (
        err.message ===
        "undefined is not an object (evaluating 'cmd.command.name')"
      ) {
        logger.error(`Use: export const command\nNão qualquer outra coisa...`);
        process.exit(1);
      }
      logger.error(err);
    }
  };

  private async LoadPrefixCommands() {
    const commandF = await glob(`./src/commands/**/*.ts`, {});
    const comandos = await Promise.all(
      commandF.map(async (arquivo) => {
        const url = pathToFileURL(path.resolve(arquivo)).href;
        const modulo = await import(url);

        return {
          command: modulo.command as PrefixCommand,
        };
      })
    );

    const cmdsLoaded = comandos
      .filter(
        (cmd) => cmd.command.name && cmd.command.aliases && cmd.command.run
      )
      .map((cmd) => ({
        name: cmd.command.name,
        aliases: cmd.command.aliases,
        cooldown: {
          time: cmd.command?.cooldown?.time,
          msg: cmd.command?.cooldown?.msg,
        },
        botpermission: {
          permission: cmd.command.botpermission?.permission,
          msg: cmd.command.botpermission?.msg,
        },
        allowIds: {
          ids: cmd.command.allowIds?.ids,
          msg: cmd.command.allowIds?.msg,
        },
        run: cmd.command.run,
      }));

    if (settings?.terminalinfo?.showPrefixCommandsFiles) {
      if (cmdsLoaded.length > 0) {
          cmdsLoaded.forEach((cmd) => {
            logger.success(
              `${ck
                .hex("#98D7C2")
                .bold(`${settings.bot.prefix}${cmd.name}`)} ${ck
                .hex("#FFFF00")
                .bold("Carregado")}`
            );
          })
      }
    }

    this.on("messageCreate", (m) => {
      if (m.author.bot) return;
      if (!m.content.startsWith(`${settings.bot.prefix}`)) return;

      const now = Date.now();
      const args: string[] = m.content
        .slice(settings.bot?.prefix?.length)
        .trim()
        .split(/ +/);
      const command = args.shift()?.toLowerCase();

      const cmd = cmdsLoaded.find(
        (c) => c.name === command || c.aliases.includes(`${command}`)
      );

      if (
        cmd?.allowIds &&
        cmd.allowIds?.ids &&
        cmd.allowIds.msg &&
        !cmd.allowIds.ids.includes(m.author.id)
      ) {
        m.reply(
          cmd.allowIds?.msg?.includes("$user")
            ? cmd.allowIds?.msg?.replace("$user", `<@${m.author.id}>`)
            : cmd.allowIds.msg
        );
        return;
      }

      if (
        m.guild &&
        cmd?.botpermission.msg &&
        cmd.botpermission.permission &&
        !m?.guild.members.me?.permissions.has(cmd?.botpermission?.permission)
      ) {
        m.reply(
          cmd?.botpermission?.msg?.includes("$permissionpending")
            ? cmd?.botpermission?.msg?.replace(
                "$permissionpending",
                cmd.botpermission?.permission
              )
            : cmd?.botpermission?.msg
        );
        return;
      }

      if (cmd?.cooldown && cmd.cooldown.msg && cmd.cooldown.time) {
        if (this.cooldowns.has(m.author.id)) {
          if (now - this.cooldowns.get(m.author.id)! < cmd?.cooldown?.time) {
            m.reply(
              cmd?.cooldown?.msg?.includes("$timeleft")
                ? cmd?.cooldown?.msg?.replace(
                    "$timeleft",
                    `<t:${Math.floor(
                      (this.cooldowns.get(m.author.id)! + cmd.cooldown?.time) /
                        1000
                    )}:R>`
                  )
                : cmd?.cooldown?.msg
            );
            return;
          }
        }

        this.cooldowns.set(m.author.id, now);
        setTimeout(
          () => this.cooldowns.delete(m.author.id),
          cmd.cooldown?.time
        );
      }

      try {
        cmd?.run(m as never, m.client as never, args);
      } catch (err) {
        logger.error(err)
      };
    });

    return cmdsLoaded;
  };

  private async LoadEvents() {
    const eventosF = await glob(`./src/events/**/*.ts`, {});
    const eventos = await Promise.all(
      eventosF.map(async (arquivo) => {
        const url = pathToFileURL(path.resolve(arquivo)).href;
        const modulo = await import(url);

        return modulo;
      })
    );

    const eventsLoaded = eventos.filter((evnt) => evnt.name && evnt.run);

    if (settings?.terminalinfo?.showEventsFiles) {
      if (eventsLoaded.length > 0) {
        eventsLoaded.forEach((event) => {
          logger.success(
            `${ck.hex("#98D7C2").bold(`Evento ${event.name}`)} ${ck
              .hex("#FFFF00")
              .bold("Carregado")}`
          );
        });
      }
    }

  try {
    for (let index = 0; index < eventsLoaded.length; index++) {
      const event = eventsLoaded[index];

      if (event?.once) {
        this.once(event.name, (...args) => event.run(...args));
      } else {
        this.on(event.name, (...args) => event?.run(...args));
      }
    }
  } catch (err) {
    logger.error(err);
  };

    return eventsLoaded;
  };

  private async LoadResponders() {
    const responderF = await glob(`./src/responders/**/*.ts`, {});
    const responders = await Promise.all(
      responderF.map(async (arquivo) => {
        const url = pathToFileURL(path.resolve(arquivo)).href;
        const modulo = await import(url);

        return {
          customId: modulo?.responder?.customId,
          type: modulo?.responder?.type,
          run: modulo?.responder?.run,
        };
      })
    );

    const respondersLoaded = responders
      .filter((cmd) => cmd.customId && cmd.type && cmd.run)
      .map((cmd) => ({
        customId: cmd.customId,
        type: cmd.type,
        run: cmd.run,
      }));

    if (settings?.terminalinfo?.showResponderFiles) {
      if (respondersLoaded.length > 1) {
        respondersLoaded.forEach((res) => {
          logger.success(
            `${ck.hex("#98D7C2").bold(`Responder ${res.customId}`)} ${ck
              .hex("#FFFF00")
              .bold("Carregado")}`
          );
        });
      }
    }

    this.on("interactionCreate", async (i) => {
      if (
        !i.isButton() &&
        !i.isChannelSelectMenu() &&
        !i.isModalSubmit() &&
        !i.isRoleSelectMenu() &&
        !i.isStringSelectMenu() &&
        !i.isRoleSelectMenu() &&
        !i.isUserSelectMenu()
      )
        return;

      const res = respondersLoaded.find(
        async (res) =>
          res.customId === i.customId && res.type === (await GetInteraction(i))
      );

      if (i.customId === res?.customId) {
        try {
          res.run(i);
        } catch (err) {
          logger.error(err);
        }
      }
    });

    return respondersLoaded;
  };

  private WebhookError() {
    const webhook = new WebhookClient({
      url: `${settings.bot.WebhookError}`
    });

    const embed = new EmbedBuilder({
      author: {
        name: `Error - ${this.user?.tag}`,
        iconURL: this.user?.displayAvatarURL(),
      }
    });

    this.on('error', (err) => {
      logger.error(err);
      embed.setDescription(`${err}`);
      webhook.send({ embeds: [embed]});
    });

    process.on('unhandledRejection', (err) => {
      logger.error(err);
      embed.setDescription(`${err}`);
      webhook.send({ embeds: [embed]});
    });

    process.on('uncaughtException', (err) => {
      logger.error(err);
      embed.setDescription(`${err}`);
      webhook.send({ embeds: [embed]});
    });
  };

  public async init() {
    if (!settings.bot.BotToken) {
      logger.error("BotToken Not Founded, Put in ./src/settings.ts");
      process.exit(1);
    }

    this.login(settings.bot.BotToken);

    this.on("ready", async () => {
      const slashCommands = await this.LoadSlashCommands();
      const prefixCommands = settings.bot?.prefix
        ? await this.LoadPrefixCommands()
        : null;
      const eventsLoaded = await this.LoadEvents();
      const responderLoaded = await this.LoadResponders();
      settings.bot?.WebhookError ? this.WebhookError() : undefined;

      console.log(); // --> Pular linha
      logger.success(`Logado em ${this.user?.username}`);

      if (settings?.terminalinfo?.showSlashCommandsRegistred) {
        logger.success(`⏺ ${Array(slashCommands).length ?? "0"} Slashcommands`);
      }

      if (settings?.terminalinfo?.showPrefixCommandsRegistred) {
        logger.success(
          `⏺ ${Array(prefixCommands).length ?? "0"} Prefixcommands`
        );
      }

      if (settings?.terminalinfo?.showEventsRegistred) {
        logger.success(`⏺ ${Array(eventsLoaded).length ?? "0"} Eventos`);
      }

      if (settings?.terminalinfo?.showResponderRegistred) {
        logger.success(`⏺ ${Array(responderLoaded).length ?? "0"} Responders`);
      }
    });
  }
}
