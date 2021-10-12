"use strict";

import {SlashSubCommand} from "discord-extend";
import {GuildCommandInteraction, MessageEmbed} from "discord.js";
import {Client} from "../../../Client";
import {defaultOptions} from "../../../Options";

module.exports = class extends SlashSubCommand {
	public constructor() {
		super({
			name: "config generation",
			description: "Enable or disable a generation",
			options: [
				{
					type: "INTEGER",
					name: "generation",
					description: "The generation to enable/disable",
					choices: [
						{
							name: "one",
							value: 1
						},
						{
							name: "two",
							value: 2
						},
						{
							name: "three",
							value: 3
						},
						{
							name: "four",
							value: 4
						},
						{
							name: "five",
							value: 5
						},
						{
							name: "six",
							value: 6
						},
						{
							name: "seven",
							value: 7
						},
						{
							name: "eight-alpha",
							value: 8
						}
					],
					required: true
				},
				{
					type: "BOOLEAN",
					name: "enable",
					description: "Wether to enable or disable the generation",
					required: true
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
				generations?: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
			} = client.databases.settings.get(guildId) ?? {},
			generation = interaction.options.getInteger("generation", true),
			enable = interaction.options.getBoolean("enable", true),
			generations = settings.generations ?? defaultOptions.generations;

		generations[generation] = enable;
		settings.generations = Object.assign(defaultOptions.generations, generations);
		client.databases.settings.set(guildId, settings);

		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					title: `${enable ? "Enabled" : "Disabled"} generation`,
					description: `Generation ${generation} has been ${enable ? "enabled" : "disabled"}`
				})
			]
		});
	}
};
