console.log("load matchmaking.js");
var matchmakingjs = (typeof matchmakingjs === "undefined") ? (function() {
	
	// TODO this is still copy paste code, remove redundant parts
	
	var queryUrlBase = paStatsGlobal.queryUrlBase;
	
	var uberName = undefined;
		
	/**
	 * search webservices
	 */
	// calls cb with the minutes number. -1 means nobody else is searching
	var getMinutesTillMatch = function(cb) {
		$.getJSON(paStatsGlobal.queryUrlBase+"minutesTillMatch?ubername="+model.uberName(), function(data) {
			cb(data.minutes);
		});
	};
	
	var register = function(foundGameHandler, waitHandler, errorHandler) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "hasGame",
			contentType : "application/json",
			data: JSON.stringify({
				uber_name: uberName,
				game_id: ""
			}),
			success : function(data) {
				if (data.hasGame) {
					foundGameHandler(data);
				} else {
					waitHandler();
				}
			},
			error: errorHandler
		});
	};
	
	var unregister = function(doneHandler, errorHandler) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "unregister",
			contentType : "application/json",
			data: JSON.stringify({
				uber_name: uberName,
				game_id: ""
			}),
			success: doneHandler,
			error: errorHandler
		});
	};
		
	/** Gamesetup webservices below */
	var refreshTimeout = function(callback, failcb) {
		$.getJSON(queryUrlBase+"resetMyTimeout?ubername="+uberName, function(data) {
			if (callback) {
				callback(data.hasTimeout, data.hasGameReset);
			}
		}).fail(function() {
			if (failcb) {
				failcb();
			}
		});
	}
	
	var resetGameSetup = function(callback, failcb) {
		$.get(queryUrlBase+"resetGameSetup?ubername="+uberName, function(data) {
			if (callback) {
				callback();
			}
		}).fail(function() {
			if (failcb) {
				failcb();
			}
		});
	}
	
	/** Host side webservices */ 
	var notifyHosted = function(lobbyId, doneHandler, errorHandler) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "gameHosted",
			contentType : "application/json",
			data: JSON.stringify({uber_name: uberName, game_id: lobbyId}),
			error: errorHandler,
			success: doneHandler
		});
	}
	
	var queryShouldStartServer = function(lobbyId, startGameHandler, waitHandler, errorHandler) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "shouldStartServer",
			contentType : "application/json",
			data: JSON.stringify({uber_name: uberName, game_id: lobbyId}),
			success: function(result) {
				if (result.shouldStart) {
					startGameHandler();
				} else {
					waitHandler();
				}
			},
			error: errorHandler
		});
	};
	
	/** client side webservices */
	var queryLobbyIdOfHost = function(lobbyIdHandler, waitHandler, errorHandler) {
		$.ajax({
			type : "GET",
			url : queryUrlBase + "pollGameId?ubername="+uberName,
			contentType : "application/json",
			success : function(result) {
				if (result.serverCreated) {
					lobbyIdHandler(result.lobbyId);
				} else {
					waitHandler();
				}
			},
			error: errorHandler
		});
	};
	
	var reportClientIsReadyToStart = function(lobbyId, errorHandler) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "readyToStart",
			contentType : "application/json",
			data: JSON.stringify({uber_name: uberName, game_id: lobbyId}),
			error: errorHandler
		});
	};
	
	return {
		setUberName: function(n) {
			uberName = n;
		},
		getMinutesTillMatch: getMinutesTillMatch,
		register: register,
		unregister: unregister,
		refreshTimeout: refreshTimeout,
		notifyHosted: notifyHosted,
		queryShouldStartServer: queryShouldStartServer,
		queryLobbyIdOfHost: queryLobbyIdOfHost,
		reportClientIsReadyToStart: reportClientIsReadyToStart,
		resetGameSetup: resetGameSetup
	};
}()) : matchmakingjs;