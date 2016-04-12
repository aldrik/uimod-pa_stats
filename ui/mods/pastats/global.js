// at least one other mod uses the existence of this value in the global namespace as a check if PA Stats is loaded
// => do not remove
function checkPaStatsVersion() {
	$.get(paStatsGlobal.queryUrlBase + "report/version", function(v) {
		localStorage['pa_stats_req_version'] = v.version;
	});
}
var paStatsGlobal = (function() {
	//check if we are currently in development mode and determine correct URL to use
	var _queryUrlBase = paStatsHost;

	var _reportVersion = 20;

	var _pollingSpeed = 3000;
	
	function _createSimplePlanet(system) {
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
	
	function _unlockGame(finalCall) {
		var link = decode(localStorage['pa_stats_game_link']);
		if (link !== undefined) {
			$.ajax({
				type : "GET",
				url : _queryUrlBase + "report/unlock?link=" + decode(link),
				complete : function(r) {
					if (finalCall) {
						finalCall();
					}
				}
			});
		} else {
			if (finalCall) {
				finalCall();
			}
		}
	}

	var _checkIfPlayersAvailable = function(elemId, cb) {
		$.ajax({
			type : "GET",
			url : _queryUrlBase + "hasPlayersSearching",
			contentType : "application/json",
			success : function(result) {
				if (result.hasPlayers) {
					if (cb) {
						cb();
					}
					$(elemId).show();
				} else {
					$(elemId).hide();
				}
				setTimeout(function() {_checkIfPlayersAvailable(elemId, cb);}, _pollingSpeed)
			}
		});
	};
	
	var nanodesu = "info.nanodesu.pastats.";
	var _wantsToSendKey = 'pa_stats_wants_to_send_';
	var _showDataLiveKey = "pa_stats_show_data_live";
	var _isRankedGame = nanodesu + "isRanked";
	var _autoPause = nanodesu + "autopauseenabled";
	
	// make sure the defaults are set
	if (localStorage[_wantsToSendKey] === undefined) {
		localStorage[_wantsToSendKey] = encode(true);
		localStorage[_showDataLiveKey] = encode(true);	
	}
	
	if (localStorage[_autoPause] === undefined) {
		localStorage[_autoPause] = encode(true);
	}
	
	return {
		createSimplePlanet: _createSimplePlanet,
		wantsToAutopause: _autoPause,
		pa_stats_session_teams : nanodesu + "teams",
		pa_stats_session_team_index : nanodesu + "team_index",
		pa_stats_stored_version : nanodesu + "version",
		pa_stats_replay_started_in_session: nanodesu + "replaystarted", 
		lastConfirmedRankedLobby: nanodesu + "lastConfirmedRankedLobby",
		isLocalGame: nanodesu + "isLocalGame",
		vetoMapName: nanodesu + "vetoMap",
		wantsToSendKey : _wantsToSendKey,
		showDataLiveKey : _showDataLiveKey,
		isRankedGameKey: _isRankedGame,
		unlockGame: _unlockGame,
		reportVersion: _reportVersion,
		queryUrlBase: _queryUrlBase,
		pollingSpeed: _pollingSpeed,
		copyRelevantSystemInfo: copyRelevantSystemInfo,
		checkIfPlayersAvailable: _checkIfPlayersAvailable
	};
}());
