"use strict";

import {SlashSubCommand} from "discord-extend";
import {GuildCommandInteraction, MessageEmbed} from "discord.js";
import {Client} from "../../../Client";
import {defaultOptions} from "../../../Options";

module.exports = class extends SlashSubCommand {
	public constructor() {
		super({
			name: "config level",
			description: "Set the pokemon min and max level of the guild",
			options: [
				{
					type: "INTEGER",
					name: "min",
					description: "The min level of pokemon"
				},
				{
					type: "INTEGER",
					name: "max",
					description: "The max level of pokemon"
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
			{guildId} = interaction,
			settings: {
				spawnChannel?: string;
				spawnRate?: number;
				minLevel?: number;
				maxLevel?: number;
			} = client.databases.settings.get(guildId) ?? {};

		let min = interaction.options.getInteger("min", false),
			max = interaction.options.getInteger("max", false);

		if (min === null && max === null) {
			min = settings.minLevel ?? defaultOptions.minLevel;
			max = settings.maxLevel ?? defaultOptions.maxLevel;

			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "BLUE",
						title: "Current pokemon level",
						description: `The current pokemon level is between ${min} and ${max}`
					})
				]
			});
			return;
		}

		min ??= (settings.minLevel ?? defaultOptions.minLevel) as number;
		max ??= (settings.maxLevel ?? defaultOptions.maxLevel) as number;

		if (min < 1 || max < 1) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Invalid pokemon level",
						description: "The min and max level must both be at least 1"
					})
				]
			});
			return;
		}

		if (min > max) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Invalid min level",
						description: "The min level can't be more than the max level"
					})
				]
			});
			return;
		}

		settings.minLevel = min;
		settings.maxLevel = max;
		client.databases.settings.set(guildId, settings);
		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					title: "Pokemon level set",
					description: `Succesfully set the pokemon spawn level between ${min} and ${max}`
				})
			]
		});
	}
};
