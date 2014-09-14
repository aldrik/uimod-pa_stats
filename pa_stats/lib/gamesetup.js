console.log("load gamesetup.js");
var gamesetupjs = (typeof gamesetupjs === "undefined") ? (function() {
	var ladderPassword = "tH4NksFoRn0tH4Ck1nGmE";

	var map = undefined;
	var acu = {
		ObjectName : "QuadOsiris"
	};

	var isHost = false;

	var lobbyId = undefined;
	
	var chatHandler = undefined;
	
	var serverCreated = ko.observable(false);
	var serverLoaded = ko.observable(false);
	var clientLoaded = ko.observable(false);
	
	var myLoadIsComplete = ko.computed(function() {
		return isHost ? serverLoaded() && clientLoaded() : clientLoaded();
	});
	
	var latestArmies = undefined;
	var loadedPlanet = undefined;

	var lobbyLoadedHandler = undefined;
	var landingHandler = undefined;

	var everythingFailedHandler = undefined;

	var testLoadInterval = undefined;

	var joinedLobby = false;

	var onLeaveHandler = undefined;
	
	var messagePending = false;
	
	var startedServer = false;
	var startedConnectingLobby = false;
	
	var playersInLobby = undefined;
	
	var thisPlayerReady = false;
	var thisPlayerName = undefined;
	
	var ignoreNextMessageResult = false;
	var oldSendMessage = model.send_message;
	model.send_message = function(name, data, cb) {
		messagePending = true;
		oldSendMessage(name, data, function(result) {
			if (!ignoreNextMessageResult && cb) {
				cb(result);
			}
			messagePending = false;
		});
	};
	
	var reset = function() {
		engine.call('reset_game_state');
		stopTestLoading();
		isHost = false;
		lobbyId = undefined;
		serverLoaded(false);
		clientLoaded(false);
		latestArmies = undefined;
		loadedPlanet = undefined;
		lobbyLoadedHandler = undefined;
		joinedLobby = false;
		onLeaveHandler = undefined;
		ignoreNextMessageResult = false;
		startedServer = false;
		startedConnectingLobby = false;
		playersInLobby = undefined;
		thisPlayerReady = false;
		thisPlayerName = undefined;
		serverCreated(false);
	};

	var leaveGame = function(cb) {
		ignoreNextMessageResult = true;
		var callback = function(cnt) {
			if (messagePending && cnt < 4) {
				console.log("not finishing leaving game yet, there is a message pending");
				setTimeout(callback, cnt * 4000);
			} else {
				if (messagePending) {
					messagePending = false;
					console.log("waiting too long, ignore pending message. This may lead to errors if the message hits us from here onwards :(");
				}
				reset();
				if (cb) {
					setTimeout(cb, 5000);
				}
			}
		};
		if (joinedLobby) {
			model.send_message('leave');
			onLeaveHandler = function() {
				callback(1);
			};
		} else {
			callback(1);
		}
	};
	
	function fixupPlanetConfig(planets) {
		for (var p = 0; p < planets.length; ++p) {
			var planet = planets[p];
			if (planet.hasOwnProperty('position_x')) {
				planet.position = [ planet.position_x, planet.position_y ];
				delete planet.position_x;
				delete planet.position_y;
			}
			if (planet.hasOwnProperty('velocity_x')) {
				planet.velocity = [ planet.velocity_x, planet.velocity_y ];
				delete planet.velocity_x;
				delete planet.velocity_y;
			}
			if (planet.hasOwnProperty('planet')) {
				planet.generator = planet.planet;
				delete planet.planet;
			}
		}
		return planets;
	}

	var testLoading = function() {
		stopTestLoading();
		var worker = function() {
			var worldView = api.getWorldView(0);
			if (worldView) {
				worldView.arePlanetsReady().then(function(ready) {
					clientLoaded(ready);
					model.send_message('set_loading', {
						loading : !ready
					});
				});
			}
		};
		testLoadInterval = setInterval(worker, 750);
	};

	var stopTestLoading = function() {
		if (testLoadInterval) {
			clearInterval(testLoadInterval);
			testLoadInterval = undefined;
		}
	};

	var getConfig = function() {
		var desc = {
				"blocked" : [],
				"enable_lan" : false,
				"friends" : [],
				"password" : ladderPassword,
				"spectators" : 1,
				"system" : map,
				"type" : "0",
				"public" : false,
				"game_name" : "visit pastats.com for 1vs1 automatches",
				"game_options" : {
					"listen_to_spectators" : true
				}
			};
	
			fixupPlanetConfig(desc.system.planets);
			return desc;
	};
	
	var setPublic = function(cb) {
		console.log("make game public");
		var desc = getConfig();
		desc['public'] = true;
		
		var modifySettings = function(failed) {
			model.send_message('modify_settings', desc, function(success) {
				if (!success) {
					console.log("failed an attempt to make the game public")
					failed();
				} else {
					console.log("modified settings: set public");
					if (cb) {
						cb();
					}
				}
			});
		};

		var tryMakePublic = function(cnt) {
			if (cnt < 4) {
				modifySettings(function() {
					setTimeout(function() {
						tryMakePublic(cnt + 1);
					}, cnt * 3000);
				});
			} else {
				fail("could not make game public");
			}
		};
		
		tryMakePublic(1);
	};
	
	var changeMap = function(system, cb) {
		var tryChangeMap = function(cnt) { 
			if (cnt < 4) {
				fixupPlanetConfig(system.planets);
				model.send_message('modify_system', system, function(s) {
					if (s) {
						console.log("map changed");
						cb();
					} else {
						console.log("failed to change the map.");
						setTimeout(function() {
							tryChangeMap(cnt + 1);
						}, cnt * 3000);
					}
				});
			} else {
				fail("coult not change map");
			}
		};
		
		tryChangeMap(1);
	};
	
	var configure1v1 = function(failhandler) { // configure has no callback for finished, as the server load will only be finished if configure is done anyway
		console.log("configure 1vs1");

		var desc = getConfig();
		
		var modifySystem = function() {
			model.send_message('modify_system', desc.system, function(success) {
				if (!success) {
					failhandler("modify_system: "+JSON.stringify(desc.system));
				} else {
					console.log("modified system");
				}
			});
		};
		
		var modifySettings = function() {
			model.send_message('modify_settings', desc, function(success) {
				if (!success) {
					failhandler("modify_settings");
				} else {
					console.log("modified settings");
					modifySystem();
				}
			});
		};
		
		var resetArmies = function() {
			model.send_message('reset_armies', [ {
				slots : 1,
				ai : false,
				alliance : false
			}, {
				slots : 1,
				ai : false,
				alliance : false
			} ], function(success) {
				if (!success) {
					failhandler("reset_armies");
				} else {
					console.log("reset armies");
					modifySettings();
				}
			});
		};
		
		resetArmies();
	};

	var joinLobby = function(lobbyId, playerName, loadedHandler) {
		thisPlayerName = playerName;
		if (startedConnectingLobby) {
			return;
		}
		console.log("starting to join lobby "+lobbyId+" as "+playerName);
		lobbyLoadedHandler = loadedHandler;
		startedConnectingLobby = true;
		isHost = false;
		internalJoinLobby(lobbyId, playerName);
	};
	
	var connectToServer = function(data, playerName) {
		console.log("connecting to server @ "+data.ServerHostname+":"+data.ServerPort);
		api.net.connect({
			host : data.ServerHostname,
			port : data.ServerPort,
			displayName : playerName,
			ticket : data.Ticket,
			clientData : {
				password : ladderPassword,
				uberid: decode(sessionStorage['uberId'])
			}
		});
	};
	
	var internalJoinLobby = function(lId, pName) {
		console.log("internal join lobby");
		messagePending = true;
		engine.asyncCall("ubernet.joinGame", lId).done(function(data) {
			messagePending = false;
			console.log("joinGame done");
			try {
				data = JSON.parse(data);
				if (data.PollWaitTimeMS) {
					console.log("pollWaitTimeMS is set, wait a little while");
					setTimeout(function() {
						console.log("waited enough, retrying...");
						internalJoinLobby(lId, pName);
					}, 5000);
				} else {
					engine.call('disable_lan_lookout');
					lobbyId = lId;
					connectToServer(data, pName);
				}
			} catch (e) {
				fail("failed to parse join game json: "+e);
			}
		}).fail(function(data) {
			messagePending = false;
			fail("failed to join lobby for lobby id "+lId);
		});
	};
	
	var createServer = function(playerName, region, lobbyLoadCb) {
		thisPlayerName = playerName;
		if (startedServer) {
			return;
		}
		startedServer = true;
		isHost = true;
		messagePending = true;
		lobbyLoadedHandler = lobbyLoadCb;

		console.log("starting server");
		api.net.startGame(region, "Config").done(function(data) {
			messagePending = false;
			console.log("server started: ");
			console.log(data);
			lobbyId = data.LobbyID;
			connectToServer(data, playerName);
		}).fail(function(data) {
			messagePending = false;
			fail("startGame resulted in FAIL: " + JSON.stringify(data));
		});
	};

	var fail = function(reason) {
		console.log("failed, this is final, can't recover. Handling over control to failhandler with reason " + reason);
		reset();
		setTimeout(function() {
			console.log("fail handler running now...");
			everythingFailedHandler(reason);
		}, 10000);
	};

	var ensureReadyUp = function() {
		console.log("ensureReadyUp, current ready state = "+thisPlayerReady);
		if (!thisPlayerReady) {
			console.log("try to toggle ready");
			model.send_message('toggle_ready', undefined, function(r) {
				console.log("toggle ready success = "+r);
			});
		}
	};
	
	var configureCommanderAndReadyUpBase = function(completeHandler, failHandler) {
		var toggleReady = function() {
			model.send_message('toggle_ready', undefined, function(r) {
				if (r) {
					console.log("toggle ready");
					if (isHost) {
						serverCreated(true);
					}
					completeHandler();
				} else {
					failHandler("toggle ready failed!");
				}
			});
		};

		var updateCommander = function() {
			model.send_message('update_commander', {
				commander : {
					ObjectName : acu.ObjectName
				}
			}, function(r) {
				if (r) {
					console.log("updated commander");
					toggleReady();
				} else {
					failHandler("updated commander failed!");
				}
			});
		};

		updateCommander();
	}

	var configureCommanderAndReadyUp = function(slot, completeHandler) {
		var tryJoin = function(cnt) {
			if (cnt < 4) {
				configureCommanderAndReadyUpBase(slot, completeHandler, function(reason) {
					console.log("failed to configure commander and ready up will retry soon");
					setTimeout(function() {
						console.log("called will retry now");
						tryJoin(cnt + 1);
					}, cnt * 3000);
				});
			} else {
				fail(note);
			}
		};
		tryJoin(1);
	};
	
	var startGame = function() {
		var tryStartGame = function(cnt) {
			console.log("trying to launch");
			model.send_message('start_game', undefined, function(r) {
				console.log("start_game sent r="+r);
				if (!r) {
					if (cnt < 4) {
						setTimeout(function() {
							tryStartGame(cnt + 1);
						}, cnt * 3000);
					} else {
						fail("coult not start game");
					}
				}
			});
		};
		
		tryStartGame(1);
	};
		
	var setupHandlers = function(handlers) {
		
		handlers.chat_message = function(msg) {
			console.log("received chat");
			console.log(msg);
			if (chatHandler) {
				chatHandler(msg.message);
			}
		};
		
		handlers.control = function(payload) {
			console.log("control triggered");
			console.log(payload);
			if (!payload.has_first_config && isHost) {
				console.log("try to configure...");
				var tryConfigure = function(cnt) {
					configure1v1(function(note) {
						if (cnt < 4) {
							console.log("failed to configure due to " + note
									+ " will retry soon");
							setTimeout(function() {
								tryConfigure(cnt + 1);
							}, cnt * 3000);
						} else {
							fail(note);
						}
					});
				}
				tryConfigure(1);
			} else {
				console.log("do not try to configure");
				console.log("payload.has_first_config = "
						+ payload.has_first_config);
				console.log("isHost = " + isHost);
			}

			serverLoaded(payload.has_first_config && payload.sim_ready);
			console.log("server load state = " + serverLoaded());
		};

		handlers.system = function(payload) {
			loadedPlanet = payload;
			console.log("got configured system");
			console.log(loadedPlanet);
		};
		
		handlers.armies = function(payload) {
			latestArmies = payload;
			console.log("latestArmies set");
			console.log(latestArmies);
		};
		
		handlers.server_state = function(msg) {
			console.log("server_state = " + msg.state);
			console.log(msg);

			if (msg.data && msg.data.armies) {
				handlers.armies(msg.data.armies);
			}

			if (msg.data && msg.data.system) {
				handlers.system(msg.data.system);
			}
			
			if (msg.state === 'landing') {
				landingHandler(function() {
					window.location.href = msg.url;
				});
			} else if (msg.state === 'lobby' && !joinedLobby) {
				joinedLobby = true;
				console.log("entered lobby");

				testLoading();

				console.log("join army...");
				configureCommanderAndReadyUp(lobbyLoadedHandler);
			}
		};
		
		handlers.connection_failed = function(payload) {
			console.log("connection failed");
			fail("connection failed " + JSON.stringify(payload));
		};

		handlers.connection_disconnected = function(payload) {
			if (onLeaveHandler) {
				onLeaveHandler();
				onLeaveHandler = undefined;
			} else {
				console.log("connection disconnected");
				fail("connection disconnected " + JSON.stringify(payload));
			}
		};

		handlers.login_rejected = function(payload) {
			console.log("login rejected");
			fail("login rejected " + JSON.stringify(payload));
		};

		handlers.login_accepted = function(payload) {
			console.log("login accepted");
			app.hello(handlers.server_state, handlers.connection_disconnected);
		};
		
		handlers.players = function(payload) {
			playersInLobby = payload;
			
			_.forEach(payload, function(element) {
				if (thisPlayerName == element.name) {
					thisPlayerReady = element.ready;
				} 
			});
			
			thisPlayerReady
		};
	};

	var adaptServerGameConfig = function(system) {
		var planets = system.planets;
		for (var p = 0; p < planets.length; ++p) {
			var planet = planets[p];
			if (planet.hasOwnProperty('position')) {
				planet.position_x = planet.position[0];
				planet.position_y = planet.position[1];
				delete planet.position;
			}
			if (planet.hasOwnProperty('velocity')) {
				planet.velocity_x = planet.velocity[0];
				planet.velocity_y = planet.velocity[1];
				delete planet.velocity;
			}
			if (planet.hasOwnProperty('generator')) {
				planet.planet = planet.generator;
				delete planet.generator;
			}
		}
		return system;
	}	
	
	var sendChat = function(msg) {
		model.send_message("chat_message", {message: msg}, function(r) {
			if (r) {
				console.log("send chat: "+msg);
			} else {
				console.log("failed to send chat: "+msg);
			}
		});
	};
	
	var playersReadyFor1vs1 = function() {
		return playersInLobby && playersInLobby.length === 2 && !playersInLobby[0].loading && !playersInLobby[1].loading;
	};
	
	return {
		setupHandlers : setupHandlers,
		createServer : createServer,
		setMap : function(m) {
			map = m;
		},
		getLoadedMap: function() {
			return loadedPlanet ? adaptServerGameConfig(loadedPlanet) : undefined;
		},
		setAcu : function(a) {
			acu = a;
		},
		setFailHandler : function(cb) {
			everythingFailedHandler = cb;
		},
		setChatHandler: function(h) {
			chatHandler = h;
		},
		ensureReadyUp: ensureReadyUp,
		sendChat: sendChat,
		serverLoaded : serverLoaded,
		clientLoaded : clientLoaded,
		playersReadyFor1vs1: playersReadyFor1vs1,
		myLoadIsComplete: myLoadIsComplete,
		leaveGame : leaveGame,
		setPublic: setPublic, /** it seems that if you know the lobbyid you can actually join private games directly, so this is not strictly required */
		changeMap: changeMap,
		joinLobby: joinLobby,
		startGame: startGame,
		getLobbyId: function() {
			return lobbyId;	
		},
		serverCreated: serverCreated,
		setLandingHandler: function(h) {
			console.log("set landing handler");
			landingHandler = h;
		},
		getLatestArmies: function() {
			return latestArmies;
		}
	}
}()) : gamesetupjs;

