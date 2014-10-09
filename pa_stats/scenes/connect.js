(function() {
	var oldStartGame = api.net.startGame;
	api.net.startGame = function(region, mode) {
		var r = oldStartGame(region, mode);
		localStorage[paStatsGlobal.isLocalGame] = encode(region === 'Local');
		return r;
	};
}());