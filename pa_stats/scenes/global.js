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

	var _reportVersion = 16;

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

	var _checkIfPlayersAvailable = function(elemId) {
		$.ajax({
			type : "GET",
			url : _queryUrlBase + "hasPlayersSearching",
			contentType : "application/json",
			success : function(result) {
				if (result.hasPlayers) {
					$(elemId).show();
				} else {
					$(elemId).hide();
				}
				setTimeout(function() {_checkIfPlayersAvailable(elemId);}, _pollingSpeed)
			}
		});
	};
	
	var nanodesu = "info.nanodesu.pastats.";
	var _wantsToSendKey = 'pa_stats_wants_to_send_';
	var _showDataLiveKey = "pa_stats_show_data_live";
	var _isRankedGame = nanodesu + "isRanked";

	// make sure the defaults are set
	if (localStorage[_wantsToSendKey] === undefined) {
		localStorage[_wantsToSendKey] = encode(true);
		localStorage[_showDataLiveKey] = encode(true);	
	}
	
	return {
		createSimplePlanet: _createSimplePlanet,
		pa_stats_session_teams : nanodesu + "teams",
		pa_stats_session_team_index : nanodesu + "team_index",
		pa_stats_stored_version : nanodesu + "version",
		wantsToSendKey : _wantsToSendKey,
		showDataLiveKey : _showDataLiveKey,
		isRankedGameKey: _isRankedGame,
		unlockGame: _unlockGame,
		reportVersion: _reportVersion,
		queryUrlBase: _queryUrlBase,
		pollingSpeed: _pollingSpeed,
		checkIfPlayersAvailable: _checkIfPlayersAvailable
	};
}());
