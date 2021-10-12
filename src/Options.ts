"use strict";

export const defaultOptions: {
	generations: [boolean, boolean, boolean, boolean, boolean, boolean, boolean, boolean];
	spawnRate: number;
	minLevel: number;
	maxLevel: number;
} = {
	generations: [true, true, true, true, true, true, true, false],
	spawnRate: 10,
	minLevel: 1,
	maxLevel: 100
};
