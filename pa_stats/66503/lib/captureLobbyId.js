model.lobbyId.subscribe(function(v) {
	localStorage['lobbyId'] = encode(v);
});