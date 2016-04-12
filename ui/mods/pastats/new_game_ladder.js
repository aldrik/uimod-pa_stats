(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(true);
	localStorage[paStatsGlobal.isLocalGame] = encode(false);
	
	var unfixupPlanetConfig = function (system) {
        if (!system.planets)
            system.planets = [];

        var planets = system.planets || [];
        for (var p = 0; p < planets.length; ++p)
        {
            var planet = planets[p];
            if (planet.hasOwnProperty('position'))
            {
                planet.position_x = planet.position[0];
                planet.position_y = planet.position[1];
                delete planet.position;
            }
            if (planet.hasOwnProperty('velocity'))
            {
                planet.velocity_x = planet.velocity[0];
                planet.velocity_y = planet.velocity[1];
                delete planet.velocity;
            }
            if (planet.hasOwnProperty('generator'))
            {
                planet.planet = planet.generator;
                delete planet.generator;
            }
        }
        return system;
    };
	
	var setCapturedSystem = function(v) {
		localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(paStatsGlobal.copyRelevantSystemInfo(v));
	};

	var oldSystemHandler = handlers.system;
	handlers.system = function(payload) {
		var system = unfixupPlanetConfig(JSON.parse(JSON.stringify(payload)));
		if (system.planets.length > 0) {
			setCapturedSystem(system);
		}
		oldSystemHandler(payload);
	};
}());