(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	
	var oldOnCommand = model.onCommand;
	model.onCommand = function(uberid, command) {
		try {
			console.log("oncommand called");
			console.log(command);
			if (command.message_type === 'game_lobby_info' && model.acceptedGameInviteFrom() === uberid) {
				localStorage['lobbyId'] = encode(command.payload.lobby_id);
				localStorage[paStatsGlobal.isLocalGame] = encode(command.payload.local_game === true);
			}
		} catch (iCouldNotActuallyTestTheCodeAbove) {
			console.log("There is no cake for you");
		}
		oldOnCommand(uberid, command);
	}
}());