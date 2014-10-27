(function() {
	var oldJoinGame = model.joinGame;
	model.joinGame = function(lobbyId) {
		localStorage['lobbyId'] = encode(lobbyId);
		return oldJoinGame(lobbyId);
	};
}());