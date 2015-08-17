(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var setCapturedSystem = function(v) {
		localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(paStatsGlobal.copyRelevantSystemInfo(v));
	};

	var oldSystemHandler = handlers.system;
	handlers.system = function(payload) {
		var unfixFunc = model.unfixupPlanetConfig || UberUtility.unfixupPlanetConfig; // support different patch versions
		var system = unfixFunc(JSON.parse(JSON.stringify(payload)));
		if (system.planets.length > 0) {
			setCapturedSystem(system);
		}
		oldSystemHandler(payload);
	};
}());