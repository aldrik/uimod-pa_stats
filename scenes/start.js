var oldJoinGame = model.joinGame;
model.joinGame = function(lobbyId) {
	localStorage['lobbyId'] = encode(lobbyId);
	oldJoinGame(lobbyId);
}
checkPaStatsVersion();