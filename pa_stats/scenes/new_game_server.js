console.log("loaded new_game for server PA Stats");

(function() {
	var oldChatHandler = handlers.chat_message;
	
	handlers.chat_message = function(payload) {
		if (payload.message.indexOf('"id":"pastats-custom-message"') !== -1) {
			var data = JSON.parse(payload.message);
			if (decode(localStorage['lobbyId']) !== data.lobbyId) {
				localStorage['lobbyId'] = encode(data.lobbyId);
				localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
				localStorage[paStatsGlobal.isLocalGame] = encode(false);
				console.log("set lobbyId from custom chat message: "+data.lobbyId);
			}
		} else {
			oldChatHandler(payload);
		}
	};
	
	var sendLobbyIdChat = function(lobbyId) {
		var msg = {};
		msg.id = "pastats-custom-message";
		msg.lobbyId = lobbyId;
		model.send_message("chat_message", {message: JSON.stringify(msg)});
	};
	
	var spamLobbyIdInfoIfHost = function() {
		if (model.isGameCreator()) {
			sendLobbyIdChat(decode(localStorage['lobbyId']));
		}
		setTimeout(spamLobbyIdInfoIfHost, 1000);
	};
	
	spamLobbyIdInfoIfHost();
}());