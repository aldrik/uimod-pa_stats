(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	model.currentSelectedGame.subscribe(function(v) {
		localStorage['lobbyId'] = encode(v.lobby_id);
	});
	
	if (!model.remoteServerAvailable()) {
		return;
	}
	
	var oldTryEnter = model.tryToEnterGame;
	model.tryToEnterGame = function() {
		var game = model.currentSelectedGame();
		if (game.region.startsWith("custom: ")) {
            // If we're looking at a locked game, we need to make sure we presented the password modal
            if (game.locked && !model.hasEnteredPassword()) {
                model.privateGamePassword();
                $('#getPassword').modal('show');
                return;
            }
            model.hasEnteredPassword(false);
            
			sessionStorage['gameHostname'] = encode(game.host);
			sessionStorage['gamePort'] = encode(game.port);
			sessionStorage['is_custom_server'] = encode(true);
			localStorage[paStatsGlobal.isLocalGame] = encode(false);
// 			window.location.href = 'coui://ui/main/game/connect_to_game/connect_to_game.html';
			var params = {};
			if (_.has(game, 'required_content')){
			    if (_.size(game.required_content) > 1)
			        console.error("joinGame on server with > 1 piece of content required -- don't know what to do!");
			    params.content = _.last(game.required_content);
			}
			model.navigateToConnectToGame(params);
		} else {
			sessionStorage['is_custom_server'] = encode(false);
			oldTryEnter();
			localStorage[paStatsGlobal.isLocalGame] = encode(game.region === 'Local');
		}
	};
	
	var customBeacons = [];
	
	var listCustomServers = function() {
		$.getJSON(paStatsGlobal.queryUrlBase+"servers", function(data) {
			var beacons = [];
			for (var i = 0; i < data.length; i++) {
				var dx = data[i];
				beacons.push({
					TitleData: JSON.parse(dx.beacon),
					LobbyId: dx.id,
					host: dx.ip,
					Port: dx.port,
					BuildVersion: dx.version
				});
			}
			
			for (var i = 0; i < customBeacons.length; i++) {
				var found = false;
				for (var j = 0; j < beacons.length; j++) {
					if (beacons[j].TitleData.uuid === customBeacons[i].TitleData.uuid) {
						found = true;
						break;
					}
				}
				if (!found) {
					handlers.lost_beacon(customBeacons[i]);
				}
			}
			
			customBeacons = beacons;
			
			for (var i = 0; i < customBeacons.length; i++) {
				var oldProcessBeacon = model.processGameBeacon;
				try {
					var reg = customBeacons[i].TitleData.region;
					model.processGameBeacon = function(t, r, lid, h, p) {
						return oldProcessBeacon(t, "custom: "+ reg, lid, h, p);
					};
					handlers.update_beacon(customBeacons[i]);
				} finally {
					model.processGameBeacon = oldProcessBeacon;
				}
			}
		});
	};
	listCustomServers();
	setInterval(listCustomServers, 5000);
}());