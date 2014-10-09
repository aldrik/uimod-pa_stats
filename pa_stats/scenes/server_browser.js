(function() {
	model.currentSelectedGame.subscribe(function(v) {
		localStorage['lobbyId'] = encode(v.lobby_id);
	});
	
	var oldTryEnter = model.tryToEnterGame;
	model.tryToEnterGame = function() {
		oldTryEnter();
		localStorage[paStatsGlobal.isLocalGame] = encode(model.currentSelectedGame().region === 'Local');
	};
}());