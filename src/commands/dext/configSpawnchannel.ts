"use strict";

import {SlashSubCommand} from "discord-extend";
import {GuildCommandInteraction, MessageEmbed} from "discord.js";
import {Client} from "../../Client";

module.exports = class extends SlashSubCommand {
	public constructor() {
		super({
			name: "config spawnchannel",
			description: "Set the spawnchannel of the server",
			options: [
				{
					type: "CHANNEL",
					name: "spawnchannel",
					description: "The channel to set as spawn channel"
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
			channel = interaction.options.getChannel("spawnchannel", false),
			{guildId} = interaction;

		if (!channel) {
			const spawnChannel = client.databases.spawnChannels.get(guildId);
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "BLUE",
						title: "Current spawn channel",
						description: `${
							spawnChannel
								? "No current spawn channel"
								: `The current spawn channel of this guild is ${interaction.guild?.channels.fetch(
										spawnChannel
								  )}`
						}`
					})
				]
			});
			return;
		}

		client.databases.spawnChannels.set(guildId, channel.id);
		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					title: "Spawn channel set",
					description: `Succesfully set spawn channel to ${channel}`
				})
			]
		});
	}
};
