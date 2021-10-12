"use strict";

import {join} from "path";
import {SlashCommandCheck} from "discord-extend";
import {config} from "dotenv";
import {Client} from "./Client";
config();

const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES"],
	partials: ["MESSAGE", "CHANNEL"],
	token: process.env.TOKEN as string
});

// Remove the comment in the next line and make a dos folder in commands to add discord-oversimplified commands
client.addEventsIn(join(__dirname, "events")); //.commandsIn(join(__dirname, "commands/dos"));
client.registry
	.registerCommandsIn({
		dir: join(__dirname, "commands/dext"),
		recursive: true
	})
	.registerCommandCheck(SlashCommandCheck.DEFAULT.GUILD_ONLY);
