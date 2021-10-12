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
			{guildId, user} = interaction,
			settings = client.databases.settings.get(guildId);

		if (!settings?.spawnChannel) {
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
		const pokemonName = interaction.options.getString("pokemon");
		if (spawnedPokemon.species.name !== pokemonName) {
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
		const /* species = await client.pokedex.pokemon.fetch(spawnedPokemon.species.name), */
			level = randomInt(
				settings.minLevel ?? defaultOptions.minLevel,
				settings.maxLevel ?? defaultOptions.maxLevel
			),
			moves = spawnedPokemon.moves.filter(move =>
				move.versionGroupDetails.find(
					details => details.levelLearnedAt <= level && details.moveLearnMethod.name === "level-up"
				)
			),
			pokemon: {
				name: string;
				level: number;
				moves: string[];
			} = {
				name: pokemonName,
				level,
				moves: []
			};

		// eslint-disable-next-line semi-spacing
		for (let i = 0; i < 4; i++) {
			if (!moves.length) break;
			pokemon.moves.push(moves.splice(Math.floor(Math.random() * moves.length), 1)[0].move.name);
		}

		client.setPokemon(interaction.guildId, interaction.user.id, pokemon);
		interaction.editReply({
			embeds: [
				new MessageEmbed({
					color: "GREEN",
					description: `${user} caught a level ${level} ${pokemonName}`,
					fields: [
						{
							name: "Moves",
							value: pokemon.moves.length
								? pokemon.moves.join("\n")
								: "No moves found, please contact pokeapi.co"
						}
					]
				})
			]
		});
	}
};
