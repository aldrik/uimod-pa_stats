(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var setCapturedSystem = function(v) {
		localStorage['pa_stats_loaded_planet'] = encode(paStatsGlobal.createSimplePlanet(v));
	};
	model.loadedSystem.subscribe(function(v) {
		setCapturedSystem(v);
		grabData();
	});
	setCapturedSystem(model.loadedSystem());
	
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
				for (var p = 0; p < army.slots().length; p++) {
					if (model.displayName() === army.slots()[p].playerName()) {
						return a;
					}
				}
			}
			return 0; // no idea what to to do here.
		}
	}
	
	function getTeams() {
		var result = [];
		
		var mySlotId = 0;
		
		for (var a = 0; a < model.armies().length; a++) {
			var army = model.armies()[a];
			var team = {
				index: a,
				players: [],
			}
			
			for (var p = 0; p < army.slots().length; p++) {
				var slot = army.slots()[p];
				
				var isHuman = slot.isPlayer();
				var isAi = slot.isAI();
				
				// this seems to fail for non host people...
//				if (slot.containsThisPlayer()) {
//					mySlotId = p;
//				}
				
				var player = {
					displayName: isAi ? "AI" : army.slots()[p].playerName(),
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
			myTeamIndex: getJoinedTeamIndex()
		};
	}
	
	var grabData = function() {
		if (model.gameIsNotOkInfo()) {
			var d = getTeams();
			localStorage[paStatsGlobal.pa_stats_session_teams] = encode(d.teams);
			localStorage[paStatsGlobal.pa_stats_session_team_index] = encode(d.myTeamIndex);
		}
	};
	
	var oldControl = handlers.control;
	handlers.control = function(payload) {
		grabData();
		oldControl(payload);
	};
	
	var oldServerState = handlers.server_state;
	handlers.server_state = function(msg) {
		grabData();
		oldServerState(msg);
	}
	
	var oldEventMessage = handlers.event_message;
	handlers.event_message = function(payload) {
		grabData();
		oldEventMessage(payload);
	};
}());