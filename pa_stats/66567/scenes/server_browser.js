model.currentSelectedGame.subscribe(function(v) {
	localStorage['lobbyId'] = encode(v.host_id);
});
