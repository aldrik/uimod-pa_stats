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

function getTeams() {
	var result = [];
	for (var a = 0; a < model.armies().length; a++) {
		var army = model.armies()[a];
		var team = new ReportTeam();
		team.index = a;
		team.primaryColor = army.primaryColor();
		team.secondaryColor = army.secondaryColor();
		
		for (var p = 0; p < army.players().length; p++) {
			var player = new ReportPlayer();
			player.displayName = army.players()[p].name();
			team.players.push(player);
		}
		
		result.push(team);
	}
	return result;
}

var joinedTeamIndexWasSet = false;
var joinedTeamIndex = 0;

var paStatsOldJoin = model.join;
model.join = function(army_index, slot_index) {
	joinedTeamIndex = army_index;
	joinedTeamIndexWasSet = true;
	paStatsOldJoin(army_index, slot_index);
}

function getJoinedTeamIndex() {
	if (joinedTeamIndexWasSet) {
		return joinedTeamIndex;
	} else {
		// in case of reloaded UI we can only try to get the id by the displayname...
		for (var a = 0; a < model.armies().length; a++) {
			var army = model.armies()[a];
			for (var p = 0; p < army.players().length; p++) {
				if (model.displayName() === army.players()[p].name()) {
					return a;
				}
			}
		}
		return 0; // no idea what to to do here.
	}
}

var paStatsOldServerState = handlers.server_state;
handlers.server_state = function(msg) {
	if (msg.url && msg.url !== window.location.href && msg.state == 'landing') {
		localStorage[pa_stats_session_teams] = encode(getTeams());
		localStorage[pa_stats_session_team_index] = encode(getJoinedTeamIndex());
	}
	paStatsOldServerState(msg);
}
