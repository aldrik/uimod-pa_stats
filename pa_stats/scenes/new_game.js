(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var setCapturedSystem = function(v) {
		for (var i = 0; i < v.planets.length; i++) {
			delete v.planets[i].planetCSG; // until the pa stats server handles the big parts more effective don't send them to pa stats :/			
		}
		localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(v);
	};

	var oldSystemHandler = handlers.system;
	handlers.system = function(payload) {
		var unfixFunc = model.unfixupPlanetConfig || UberUtility.unfixupPlanetConfig; // support different patch versions
		var system = unfixFunc(payload);
		if (system.planets.length > 0) {
			setCapturedSystem(system);
		}
		oldSystemHandler(payload);
	};
}());