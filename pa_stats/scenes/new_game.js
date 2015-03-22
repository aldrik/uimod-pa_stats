(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	// until the pa stats server handles the big parts more effective don't send them to pa stats :/
	var copyRelevantSystemInfo = function(sys) {
		var result = {};
		result.name = sys.name;
		
		result.planets = [];
		
		if (sys.planets) {
			for (var i = 0; i < sys.planets.length; i++) {
				var planet = sys.planets[i];
				if (planet) {
					var cp = {};
					cp.name = planet.name;
					cp.required_thrust_to_move = planet.required_thrust_to_move;
					cp.starting_planet = planet.starting_planet;
					cp.mass = planet.mass;
					cp.position_x = planet.position_x;
					cp.position_y = planet.position_y;
					cp.velocity_x = planet.velocity_x;
					cp.velocity_y = planet.velocity_y;
					cp.planet = {};
					if (planet.planet) {
						cp.planet.temperature = planet.planet.temperature;
						cp.planet.seed = planet.planet.seed;
						cp.planet.radius = planet.planet.radius;
						cp.planet.biome = planet.planet.biome;
						cp.planet.waterHeight = planet.planet.waterHeight;
						cp.planet.heightRange = planet.planet.heightRange;
						cp.planet.waterDepth = planet.planet.waterDepth;
						cp.planet.metalDensity = planet.planet.metalDensity;
						cp.planet.biomeScale = planet.planet.biomeScale;
						cp.planet.metalClusters = planet.planet.metalClusters;
					}
					result.planets.push(cp);
				}
			}
		}
		return result;
	};
	
	var setCapturedSystem = function(v) {
		localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(copyRelevantSystemInfo(v));
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