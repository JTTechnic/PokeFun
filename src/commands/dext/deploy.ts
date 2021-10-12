"use strict";

import {ToAPIApplicationCommandOptions} from "@discordjs/builders";
import {REST} from "@discordjs/rest";
import {Routes} from "discord-api-types/v9";
import {SlashCommand} from "discord-extend";
import {MessageEmbed, GuildCommandInteraction} from "discord.js";
import {Client} from "../../Client";

module.exports = class extends SlashCommand {
	public constructor() {
		super({
			name: "deploy",
			description: "Deploy a command",
			options: [
				{
					type: "STRING",
					name: "command",
					description: "The name of the command",
					required: true
				},
				{
					type: "BOOLEAN",
					name: "global",
					description: "Whether the command should be deployed globally",
					required: true
				}
			],
			permissions: {
				user: ["ADMINISTRATOR"]
			}
		});
	}

	public async run(interaction: GuildCommandInteraction) {
		await interaction.deferReply({ephemeral: true});
		const client = interaction.client as Client<true>,
			commandName = interaction.options.getString("command", true),
			global = interaction.options.getBoolean("global", true),
			commands = client.registry.commands.filter(command => command.name.split(" ")[0] === commandName);

		if (!commands.size) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Unknown command",
						description: `Command "${commandName}" not found`
					})
				]
			});
			return;
		}

		console.log(commands);

		const commandData = commands.reduce(
			(commandA, commandB) => ({
				name: commandB.name.split(" ")[0],
				description: commandB.description,
				defaultPermission: commandB.defaultPermission,
				options: (commandA.options ?? []).concat(commandB.options ?? [])
			}),
			{} as {
				name: string;
				description: string;
				options: ToAPIApplicationCommandOptions[];
				defaultPermission?: boolean;
			}
		);

		console.log(commandData);

		const command = new (class extends SlashCommand {
			constructor() {
				// @ts-ignore
				super(commandData);
				// @ts-ignore
				this.options = commandData.options;
			}

			// eslint-disable-next-line no-empty-function
			run() {}
		})();

		const appCommand = command.toJSON(),
			rest = new REST({version: client.options.http?.version?.toString()}).setToken(client.token);

		try {
			await rest.post(
				global
					? Routes.applicationCommands(client.application.id)
					: Routes.applicationGuildCommands(client.application.id, process.env.GUILD as string),
				{body: appCommand}
			);
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "GREEN",
						title: "Command deployed",
						description: `Succesfully deployed ${commandName} command`
					})
				]
			});
		} catch (error) {
			console.error("Command deploy error", error);
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Command not deployed",
						description: "Look at console logs for the full error"
					})
				]
			});
		}
	}
};
