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
		pokemon: Database<{
			[user: string]:
				| {
						name: string;
						level: number;
						moves: string[];
				  }[]
				| undefined;
		}>;
		settings: Database<
			| {
					spawnChannel?: string;
					spawnRate?: number;
					minLevel?: number;
					maxLevel?: number;
			  }
			| undefined
		>;
	};

	public constructor(options: ClientOptions) {
		super(options);
		this.databases.pokemon = new Database("pokemon");
		this.databases.settings = new Database("settings");
	}

	public getPokemon(guild: string, user: string) {
		return (this.databases.pokemon.get(guild) ?? {})[user] ?? [];
	}

	public setPokemon(guild: string, user: string, pokemon: {name: string; level: number; moves: string[]}) {
		const users = this.databases.pokemon.get(guild) ?? {};
		const userPokemon = users[user] ?? [];
		userPokemon.push(pokemon);
		users[user] = userPokemon;
		this.databases.pokemon.set(guild, users);
	}
}
