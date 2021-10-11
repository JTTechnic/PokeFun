"use strict";

import {randomInt} from "crypto";
import {stripIndents} from "common-tags";
import {SlashCommand} from "discord-extend";
import {MessageEmbed, GuildCommandInteraction} from "discord.js";
import {Client} from "../../Client";
import {defaultOptions} from "../../Options";

module.exports = class extends SlashCommand {
	public constructor() {
		super({
			name: "catch",
			description: "Catch a pokémon",
			options: [
				{
					type: "STRING",
					name: "pokemon",
					description: "The pokémon that you are trying to catch",
					required: true
				}
			],
			checks: ["guildOnly"]
		});
	}

	public async run(interaction: GuildCommandInteraction) {
		await interaction.deferReply();
		const client = interaction.client as Client<true>,
			{guildId, user} = interaction;
		if (!client.databases.spawnChannels.get(guildId)) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Spawn channel not set",
						description: stripIndents`
							No spawn channel has been set for this server
						Please ask someone with the \`MANAGE_GUILD\` permission to set the spawn channel of this server
							The spawn channel can be set with \`/config spawnchannel\`
						`
					})
				]
			});
			return;
		}
		const spawnedPokemon = client.spawnedPokemon.get(guildId);
		if (!spawnedPokemon) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						title: "Go into the tall grass for pokémon",
						description: "Oh, there seems to be no pokémon yet"
					})
				]
			});
			return;
		}
		const pokemon = interaction.options.getString("pokemon");
		if (spawnedPokemon.name !== pokemon) {
			interaction.editReply({
				embeds: [
					new MessageEmbed({
						color: "RED",
						description: "That's the wrong pokémon",
						footer: {
							text: "You can use /report if you think this is a bug"
						}
					})
				]
			});
			return;
		}
		client.spawnedPokemon.delete(guildId);
		const level = randomInt(defaultOptions.minlevel, defaultOptions.maxlevel),
			currentPokemon = client.databases.pokemon.get(user.id) || [];
		currentPokemon.push({name: pokemon, level: level});
		client.databases.pokemon.set(user.id, currentPokemon);
		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					description: `${user} caught a level ${level} ${pokemon}`
				})
			]
		});
	}
};
