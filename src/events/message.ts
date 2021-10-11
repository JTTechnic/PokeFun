"use strict";

import {ClientEvent} from "discord-extend";
import {Message, MessageEmbed, TextChannel} from "discord.js";
import {Client} from "../Client";
import {defaultOptions} from "../Options";

module.exports = class MessageEvent extends ClientEvent<"messageCreate"> {
	public constructor() {
		super("message", "messageCreate");
	}

	public async run(message: Message) {
		if (message.author.bot || message.webhookId || !message.guildId) {
			return;
		}
		const client = message.client as Client,
			{guildId} = message,
			spawnChannel = client.databases.spawnChannels.get(guildId);
		let messageAmount = client.messageAmount.get(guildId) ?? 0;
		if (++messageAmount === defaultOptions.spawnrate && spawnChannel) {
			messageAmount = 0;
			const pokemon = await client.pokedex.pokemon.fetchRandom();
			console.log(`A ${pokemon.name} has spawned in ${message.guild?.name}`);
			client.spawnedPokemon.set(guildId, pokemon);
			((await message.guild?.channels.fetch(spawnChannel)) as TextChannel).send({
				embeds: [
					new MessageEmbed({
						color: "BLUE",
						title: "A wild pokémon appeared!",
						description: `Use \`/catch\` to catch this pokémon`,
						image: {
							// @ts-ignore
							url: pokemon.sprites.other["official-artwork"].frontDefault
						}
					})
				]
			});
		}
		client.messageAmount.set(guildId, messageAmount);
	}
};
