var debug_ajax_ubernet = false; // print debug stuff, delay broken requests by 30s
var delay_ajax_ubernet = false; // delay even successful requests by 10s, settings this to true while debug_ajax_ubernet is false makes no sense!

(function() {
	if (decode(localStorage['info.nanodesu.pastats.use_ajax_ubernet'])) {
		console.log("AJAX UBERNET IS ENABLED");
		
		var getLocalClientVersion = function() {
			return decode(sessionStorage['build_version']); 
		};
		
		var getUbernetUrl = function() {
			var session = decode(sessionStorage['ubernet_url']);
			return typeof session === "string" ? session : "https://4.uberent.com";
		};
		
		var callUbernet = function(url, method, data, noAuth, dataType) {
			var sessionTicket = decode(sessionStorage["uberUserInfo"]);
			sessionTicket = sessionTicket != undefined ? sessionTicket.SessionTicket : undefined;
			sessionTicket = sessionTicket != undefined ? sessionTicket : decode(sessionStorage['jabberToken']);
			
			url = getUbernetUrl() + url;
			
			if (debug_ajax_ubernet) {
				console.log("call ubernet via ajax...");
				console.log("sessionTicket = "+sessionTicket);
				console.log("url = "+url);
				console.log("method = " + method);
				console.log("data:");
				console.log(data);
				console.log("noAuth = "+noAuth);
			}
			
			var def = $.Deferred();
			$.ajax({
				type: method,
				url: url,
				contentType: "application/json; charset=utf-8",
				dataType: dataType,
				beforeSend: noAuth ? undefined : function(xhr){xhr.setRequestHeader('X-Authorization', sessionTicket);},
				data: data !== undefined ? JSON.stringify(data) : undefined, 
				success: function(data) {
					if (debug_ajax_ubernet) {
						console.log("ajax ubernet success");
						console.log(data);
					}
					
					setTimeout(function() {
						def.resolve(JSON.stringify(data));
					}, delay_ajax_ubernet ? 10000 : 0);
				}, 
				error: function(result) {
					console.log("ERROR in ubernet call for url "+url+ " and method " + method);
					console.log("data sent was:");
					console.log(data);
					console.log("error was:");
					console.log(result);
					console.log(result.state());
					console.log(arguments);
					
					setTimeout(function() {
						def.reject(result);
					}, debug_ajax_ubernet ? 30000 : 0);
				}
			});
			return def;
		};
		
		var joinGame = function(lobbyId) {
			return callUbernet("/GameAcquisition/Matchmake", "POST", {
				LobbyId: lobbyId
			});
		};
		
		var startGame = function(region, mode) {
			return callUbernet("/GameAcquisition/StartGame", "POST", {
				BuildVersion: getLocalClientVersion(),
				Region: region,
				GameMode: mode
			});
		};
		
		var removePlayerFromGame = function() {
			return callUbernet("/GameAcquisition/RemovePlayerFromGame", "POST");
		};
		
		var startReplay = function(region, mode, replayId) {
			return callUbernet("/GameAcquisition/StartGame", "POST", {
				BuildVersion: getLocalClientVersion(),
				Region: region,
				GameMode: mode,
				ReplayLobbyId: replayId
			});
		};
		
		var getOnlineClientVersion = function() {
			return callUbernet("/launcher/clientversion?titleid=4", "GET", undefined, true);
		};
		
		var getServerRegions = function() {
			return callUbernet("/GameAcquisition/GetGameServerRegions?TitleId=4&BuildVersion="+getLocalClientVersion(), "GET");
		};
		
		var getLadderRating = function(mode) {
			return callUbernet("/MatchMaking/GetPlayerDisplayRating?gameMode="+mode, "GET");
		};
		
		var getGameWithPlayer = function() {
			return callUbernet("/GameAcquisition/GetGameWithPlayer", "GET");
		}
		
		var getUserInventory = function() {
			return callUbernet("/GC/UserInventory?CatalogVersion=1", "GET");
		};
		
		var getCatalog = function() {
			return callUbernet("/GameClient/PurchasableItems?CatalogVersion=1", "GET");
		};
		
		var getReplays = function(sortOrder, uberIds) {
			var uberIdsAdd = uberIds === undefined ? "" : ("&FilterUberId="+uberIds);
			return callUbernet("/GC/GetReplayList?MaxResults=100&QueryType=" + sortOrder + uberIdsAdd, "GET");
		};

		var getUserCustomData = function(keys) {
			return callUbernet("/GameClient/GetUserCustomData", "POST", {"Keys": JSON.parse(keys)});
		};
		
		var updateUserCustomData = function(keys) {
			return callUbernet("/GameClient/UpdateUserCustomData", "POST", {"Data": JSON.parse(keys)}, undefined, "text");
		};
		
		var getFriends = function(includeSteam) {
			return callUbernet("/GameClient/GetUberFriendsList?IncludeSteamFriends="+includeSteam, "GET");
		};
		
		var renameFriend = function(payload) {
			return callUbernet("/GameClient/RenameFriend", "POST", JSON.parse(payload)); 
		};
		
		var addFriendTag = function(payload) {
			return callUbernet("/GameClient/AddFriendTag", "POST", JSON.parse(payload));
		};
		
		var removeFriendTag = function(payload) {
			return callUbernet("/GameClient/RemoveFriendTag", "POST", JSON.parse(payload));
		};
		
		var setFriendTags = function(payload) {
			return callUbernet("/GameClient/SetFriendTags", "POST", JSON.parse(payload));
		};
		
		var hookEngine = function() {
			console.log("hook engine for ubernet ajax");
			
			var oldEngineCall = engine.asyncCall;
			engine.asyncCall = function() {
				if (debug_ajax_ubernet) {
					console.log("engine asyncCall was made");
					if (arguments[0].indexOf("authenticate") === -1) {
						console.log(arguments);
					} else {
						console.log(arguments[0]);
					}
				}
				
				if (arguments && arguments[0]) {
					switch (arguments[0]) {
					case "ubernet.updateUserCustomData":
						console.log("using ajax for ubernet.updateUserCustomData");
						return updateUserCustomData(arguments[1]);
						
					case "ubernet.getUserCustomData":
						console.log("using ajax for ubernet.getUserCustomData");
						return getUserCustomData(arguments[1]);
						
					case "ubernet.getFriends":
						console.log("using ajax for ubernet.getFriends");
						return getFriends(arguments[1]);
						
					case "ubernet.renameFriend":
						console.log("using ajax for ubernet.renameFriend");
						return renameFriend(arguments[1]);
						
					case "ubernet.addFriendTag":
						console.log("using ajax for ubernet.addFriendTag");
						return addFriendTag(arguments[1]);
						
					case "ubernet.removeFriendTag":
						console.log("using ajax for ubernet.removeFriendTag");
						return removeFriendTag(arguments[1]);
						
					case "ubernet.setFriendTags":
						console.log("using ajax for ubernet.setFriendTags");
						return setFriendTags(arguments[1]);
						
					case "ubernet.joinGame":
						console.log("using ajax for ubernet.joinGame");
						return joinGame(arguments[1]);
						
					case "ubernet.startGame":
						console.log("using ajax for ubernet.startGame");
						return startGame(arguments[1], arguments[2]);
						
					case "ubernet.getCurrentClientVersion":
						console.log("using ajax for ubernet.getCurrentClientVersion");
						return getOnlineClientVersion();
						
					case "ubernet.getGameServerRegions":
						console.log("using ajax for ubernet.getGameServerRegions");
						return getServerRegions();
						
					case "ubernet.getPlayerRating":
						console.log("using ajax for ubernet.getPlayerRating");
						return getLadderRating(arguments[1]);
						
					case "ubernet.getGameWithPlayer":
						console.log("using ajax for ubernet.getGameWithPlayer");
						return getGameWithPlayer();
						
					case "ubernet.getUserInventory":
						console.log("using ajax for ubernet.getUserInventory");
						return getUserInventory();
						
					case "ubernet.getCatalog":
						console.log("using ajax for ubernet.getCatalog");
						return getCatalog();
						
					case "ubernet.startReplay":
						console.log("using ajax for ubernet.startReplay");
						return startReplay(arguments[1], arguments[2], arguments[3]);
						
					case "ubernet.removePlayerFromGame":
						console.log("using ajax for ubernet.removePlayerFromGame");
						return removePlayerFromGame();
						
					case "ubernet.getReplays":
						console.log("using ajax for ubernet.getReplays");
						return getReplays(arguments[1], arguments[2]);
						
					case "ubernet.call":
						console.log("using ajax for ubernet.call for url " + arguments[1]);
						return callUbernet(arguments[1], "GET");
						
					default:
						return oldEngineCall.apply(this, arguments);
					}
				} else {
					return oldEngineCall.apply(this, arguments);
				}
			};
		};
		hookEngine();
	}
}());