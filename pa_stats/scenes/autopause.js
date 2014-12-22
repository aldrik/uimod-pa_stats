(function() {
	var disconnectState = {};

	var sendChatMessage = function(txt) {
		model.send_message("chat_message", {
			message : "[Automatic Message by PA Stats] " + txt
		});
	};

	var oldArmies = handlers.army_state;
	handlers.army_state = function(armies) {
		oldArmies(armies);

		if (decode(localStorage[paStatsGlobal.wantsToAutopause])) {
			if (!model.ranked() && model.mode() !== 'replay') {
				var a = armies;
				for (var i = 0; i < a.length; i++) {
					if (!a[i].defeated) {
						var before = disconnectState[a[i].id] === undefined ? a[i].disconnected
								: disconnectState[a[i].id];
						if (before != a[i].disconnected) {
							if (a[i].disconnected) {
								sendChatMessage(a[i].name
										+ " disconnected, pausing game");
								model.send_message('control_sim', {
									paused : true
								});
							} else {
								sendChatMessage(a[i].name
										+ " appears to be reconnecting and is loading planets right now");
							}
						}
						disconnectState[a[i].id] = a[i].disconnected;
					}
				}
			}
		} else {
			console.log("PA Stats: Autopause disabled by config");
		}
	};
}());