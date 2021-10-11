"use strict";

import {Client as DOSClient, ClientOptions, Database} from "discord-oversimplified";
import {Collection} from "discord.js";
import {Client as PokedexClient} from "pokedex-typed";
import {Pokemon} from "pokedex-typed/typings/models";

export class Client<Ready extends boolean = boolean> extends DOSClient<Ready> {
	public readonly pokedex: PokedexClient = new PokedexClient();
	public readonly messageAmount: Collection<string, number> = new Collection();
	public readonly spawnedPokemon: Collection<string, Pokemon> = new Collection();
	public readonly databases!: {
		vars: Database;
		userVars: Database<{
			[user: string]: {
				[key: string]: any;
			};
		}>;
		globalUserVars: Database<{
			[key: string]: any;
		}>;
		pokemon: Database<
			| {
					name: string;
					level: number;
			  }[]
			| undefined
		>;
		spawnChannels: Database<string>;
	};

	public constructor(options: ClientOptions) {
		super(options);
		this.databases.pokemon = new Database("pokemon");
		this.databases.spawnChannels = new Database("spawnChannels");
	}
}
