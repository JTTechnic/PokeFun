"use strict";

import {ClientEvent} from "discord-extend";
import {Client} from "../Client";

module.exports = class extends ClientEvent<"ready"> {
	public constructor() {
		super("ready", "ready", true);
	}

	public run(client: Client<true>) {
		console.log(`${client.user.username} is ready!`);
	}
};
