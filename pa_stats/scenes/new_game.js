(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var setCapturedSystem = function(v) {
		localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(v);
	};

	var oldSystemHandler = handlers.system;
	handlers.system = function(payload) {
		var system = model.unfixupPlanetConfig(payload);
		if (system.planets.length > 0) {
			setCapturedSystem(system);
		}
		oldSystemHandler(payload);
	};
}());