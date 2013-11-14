var oldHandleGameState = handlers.game_state;
var loadPlanet = ko.observable({}).extend({ local: 'pa_stats_loaded_planet' });
handlers.game_state = function (payload) {
	oldHandleGameState(payload);
	loadPlanet(createSimplePlanet(payload.system));
}

function createSimplePlanet(system) {
	var simpleplanet = {
		seed: system.planets[0].planet.seed,
		temperature: system.planets[0].planet.temperature,
		waterHeight: system.planets[0].planet.waterHeight,
		heightRange: system.planets[0].planet.heightRange,
		radius: system.planets[0].planet.radius,
		biome: system.planets[0].planet.biome,
		name: system.name
	}
	return simpleplanet;
}