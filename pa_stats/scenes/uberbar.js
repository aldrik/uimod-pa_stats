(function() {
	var oldOnCommand = model.onCommand;
	model.onCommand = function(uberid, command) {
		try {
			if (command.message_type === 'game_lobby_info' && model.acceptedGameInviteFrom() === uberid) {
				localStorage['lobbyId'] = encode(command.payload.lobby_id);
			}
		} catch (iCouldNotActuallyTestTheCodeAbove) {
			console.log("There is no cake for you");
		}
		oldOnCommand(uberid, command);
	}
}());