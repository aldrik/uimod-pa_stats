(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var loadPlanet = ko.observable({}).extend({ local: 'pa_stats_loaded_planet' });
	model.loadedSystem.subscribe(function(v) {
		loadPlanet(paStatsGlobal.createSimplePlanet(v));
	});
	
	function getTeams() {
		var result = [];
		
		var mySlotId = 0;
		
		for (var a = 0; a < model.armies().length; a++) {
			var army = model.armies()[a];
			var team = {
				index: a,
				players: [],
			}
			
			for (var p = 0; p < army.openSlots().length; p++) {
				var slot = army.openSlots()[p];
				
				var isHuman = slot.isPlayer();
				var isAi = slot.isAI();
				
				if (slot.containsThisPlayer()) {
					mySlotId = p;
				}
				
				var player = {
					displayName: isAi ? "AI" : army.openSlots()[p].playerName(),
				};
				
				if (isHuman || isAi) {
					team.players.push(player);
				}
				
				// TODO support colors per player instead of per team!
				team.primaryColor = slot.primaryColor();
				team.secondaryColor = slot.secondaryColor();
			}
			
			result.push(team);
		}
		return {
			teams: result,
			myTeamIndex: mySlotId
		};
	}

	var oldStart = model.startGame;
	model.startGame = function() {
		if (!model.gameIsNotOk()) {
			var d = getTeams();
			localStorage[paStatsGlobal.pa_stats_session_teams] = encode(d.teams);
			localStorage[paStatsGlobal.pa_stats_session_team_index] = encode(d.myTeamIndex);
		}
		oldStart();
	};
}());