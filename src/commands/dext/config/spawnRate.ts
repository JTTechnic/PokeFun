"use strict";

import {SlashSubCommand} from "discord-extend";
import {GuildCommandInteraction, MessageEmbed} from "discord.js";
import {Client} from "../../../Client";
import {defaultOptions} from "../../../Options";

module.exports = class extends SlashSubCommand {
	public constructor() {
		super({
			name: "config spawnrate",
			description: "Set the spawnrate of the server (how many messages per pokemon)",
			options: [
				{
					type: "INTEGER",
					name: "spawnrate",
					description: "The spawnrate of the server"
				}
			],
			checks: ["guildOnly"],
			permissions: {
				user: ["MANAGE_GUILD"]
			}
		});
	}

	public async run(interaction: GuildCommandInteraction) {
		await interaction.deferReply({ephemeral: true});
		const client = interaction.client as Client<true>,
			spawnRate = interaction.options.getInteger("spawnrate", false),
			{guildId} = interaction,
			settings: {
				spawnChannel?: string;
				spawnRate?: number;
			} = client.databases.settings.get(guildId) ?? {};

		if (spawnRate === null) {
			const guildSpawnRate = settings.spawnRate ?? defaultOptions.spawnRate;
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "BLUE",
						title: "Current spawn rate",
						description: `The current spawn rate of this guild is ${guildSpawnRate}`
					})
				]
			});
			return;
		}

		if (spawnRate < 1) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Invalid spawn rate",
						description: "The minimum spawn rate is 1"
					})
				]
			});
			return;
		}

		settings.spawnRate = spawnRate;
		client.databases.settings.set(guildId, settings);
		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					title: "Spawn rate set",
					description: `Succesfully set spawn rate to ${spawnRate}`
				})
			]
		});
	}
};
