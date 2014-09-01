model.currentSelectedGame.subscribe(function(v) {
	localStorage['lobbyId'] = encode(v.lobby_id);
});
