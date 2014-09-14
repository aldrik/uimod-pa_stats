(function() {

	// ubernet build version should be the non pte version, so this actually
	// checks "are we on the current official public live build or are we in a
	// test environment" :)
	if (decode(sessionStorage['ubernet_build_version']) == decode(sessionStorage['build_version'])  || (typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined')) {

		var refreshingTimeout = false;
		var searching = ko.observable(false);
		var settingupGame = ko.observable(false);
		var isHost = ko.observable(false);
		
		var checkedVetos = false;
		var opponentVetoMaps = undefined;
		
		model.showYoutubeWarningForGameFound = ko.observable(true).extend({ local: 'info.nanodesu.showyoutubewarning' });
		
		$('.section_controls > div:nth-child(1)').after('<a href="#" class="btn_std" style="width: 100%" data-bind="click: startRankedGame, click_sound: \'default\', rollover_sound: \'default\' ">'+
				'<div class="btn_label">'+
				'    PA STATS 1vs1'+
				'</div>'+
							'</a>');

		$('.div_commit_cont').prepend('<div style="font-size: 20px;padding-right: 100px;display: none;" id="pa_stats_players_note"></div>');

		var closeNote = "Someone close to your skill level is searching 1vs1 via PA Stats";
		var notCloseNote = "Another player is searching 1vs1 via PA Stats";

		paStatsGlobal.checkIfPlayersAvailable("#pa_stats_players_note", function() {
			$.getJSON(paStatsGlobal.queryUrlBase+"minutesTillMatch?ubername="+decode(localStorage['uberName']), function(data) {
				if (data.minutes <= 3) {
					$('#pa_stats_players_note').text(closeNote);
				} else {
					$('#pa_stats_players_note').text(notCloseNote);
				}
				if (searching() || settingupGame()) {
					$('#pa_stats_players_note').text("");
				}
			});
		});

		$('.title').html("Multiplayer with 1vs1 ranked games by pa stats. <a class='text-glow-hover' style='text-decoration: underline;' href='coui://ui/main/game/load_planet/load_planet.html?pastats=true'>MAPS</a>");

		// remove stupid cpu intensive glow stuff, we will need cpu power to load
		// planets
		$('.title_watermark').remove();
		$('.background_glow').remove();

	    $('body').append(
	    		'<div id="searchingPaStatsGame" class="ui-dialog-content ui-widget-content" style="display: none;">'+
	    			'<div class="div_alert" style="height: 92%" >' +
	    			'<img src="coui://ui/main/shared/img/loading.gif" class="img_progress_icon" style="margin:0px 8px 0px 0px"></img>'+
	    			'<div id="msg_progress_pa_stats" class="msg_progress_icon"></div><div id="small_msg_progress_pa_stats"></div>'+
	    			"<div>Show loud youtube warning on matchstart:  <input type='checkbox' data-bind='checked: showYoutubeWarningForGameFound' /></div>"+
	    			"<div id='ytholder'></div>"+'</div>'+
	    			"<div><span data-bind='if: model.serverLoaded'>Server ready</span> <span data-bind='if: model.clientLoaded'>Client ready</span></div>"+
	    		'</div>'
	    );

		var hideCancelBtt = function() {
			console.log("hide cancel btt");
			$("#searchingPaStatsGame").dialog("option", "buttons", {
			});
		};

		var dialogShowing = false;

		var showCancelBtt = function() {
			if (!dialogShowing) {
				showWaitDlg();
			}
			console.log("show cancel btt");
			$("#searchingPaStatsGame").dialog("option", "buttons", {
				"CANCEL": function() {
					model.cancelSearch();
	           }
			});
		};

		var showWaitDlg = function() {
			dialogShowing = true;
			$("#searchingPaStatsGame").dialog({
	            dialogClass: "no-close",
	            closeOnEscape : false,
	            draggable: false,
	            resizable: false,
	            height: 540,
	            width: 900,
	            modal: true,
	            buttons: {}
	        });
		};

		// facility to temporarily stop downloading the list of games while the
		// matchmaking happens. Should help for people with weak connections that
		// get timeouts
		var updateServerDataLocked = false;
		var oldUpdateServerData = model.updateServerData;
		model.updateServerData = function() {
			if (!updateServerDataLocked) {
				oldUpdateServerData();
			}
		};

		var uberName = ko.observable('').extend({ local: 'uberName' });
		var uberNetRegion = ko.observable().extend({ session: 'uber_net_region', local: 'uber_net_region' });
		var displayName = ko.observable('').extend({ session: 'displayName' });
		var preferredCommander = ko.observable().extend({ local: 'preferredCommander_v2' });

		var bigNotice = ko.observable("");
		var smallNotice = ko.observable("");

		bigNotice.subscribe(function(v) {
			console.log("big = "+v);
			$("#msg_progress_pa_stats").text(v);
		});

		smallNotice.subscribe(function(v) {
			console.log("small = "+v);
			$("#small_msg_progress_pa_stats").text(v);
		});

		matchmakingjs.setUberName(uberName());

		gamesetupjs.setAcu(preferredCommander() || {ObjectName: "QuadOsiris"});
		gamesetupjs.setupHandlers(handlers);
		
		var getMap = function(vetos) {
			console.log("get a map, vetos are ");
			console.log(vetos);
			var system = undefined;
			for (var t = 0; t < 1337; t++) {
				var candidate = pa_stats_mappool[Math.floor(Math.random() * pa_stats_mappool.length)];
				var veto = false;
				for (var i = 0; i < vetos.length; i++) {
					if (candidate.name === vetos[i]) {
						veto = true;
					}
				}
				if (!veto) {
					system = candidate;
					break;
				}
			}
			
			if (system === undefined) {
				console.log("faild to consider vetos :(");
				system = pa_stats_mappool[Math.floor(Math.random() * pa_stats_mappool.length)];
			}
			
			console.log("selected map is ");
			console.log(system);
			
			return system;
		};
		
		gamesetupjs.setMap(getMap([decode(localStorage[paStatsGlobal.vetoMapName])]));
		
		gamesetupjs.setLandingHandler(function(lander) {
			smallNotice("configure pa stats data...");
			localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(gamesetupjs.getLoadedMap());
			localStorage[paStatsGlobal.isRankedGameKey] = encode(true);
			localStorage['lobbyId'] = encode(gamesetupjs.getLobbyId());
			setTimeout(function() {
				smallNotice("landing...");
				lander();
			}, 1500);
		});

		gamesetupjs.serverLoaded.subscribe(function(v) {
			console.log("server loaded = "+v);
		});

		gamesetupjs.clientLoaded.subscribe(function(v) {
			console.log("client loaded = "+v);
		});

		settingupGame.subscribe(function(v) {
			if (v && model.showYoutubeWarningForGameFound()) {
				$('#ytholder').append('<div style="display: table; margin: 0 auto;" id="youtubewarning"><iframe width="300" height="200" src="http://www.youtube.com/embed/9V1eOKhYDws?autoplay=1" frameborder="0"></iframe></div>');
			} else {
				$('#youtubewarning').remove();
			}
		});

		searching.subscribe(function(v) {
			if (v) {
				showCancelBtt();
			} else {
				hideCancelBtt();
			}
		});

		var working = ko.computed(function() {
			return searching() || settingupGame();
		});

		working.subscribe(function(v) {
			updateServerDataLocked = v;
			console.log("set server list update lock = "+v);
			if(v && !dialogShowing) {
				showWaitDlg();
			} else if (!v && dialogShowing) {
				dialogShowing = false;
				$("#searchingPaStatsGame").dialog("close");
			}
		});

		var beatHandler = undefined;
		var forceBeatHandler = undefined;

		var prepareServer = function() {
			smallNotice("preparing a server");
			gamesetupjs.createServer(displayName(), uberNetRegion(), function() {
				smallNotice("lobby prepared");
				console.log("lobby prepared!");
			});
		};

		var prepareSearch = function() {
			bigNotice("preparing search");
			searching(true);
			settingupGame(false);
			prepareServer();
		};

		var checkForceBeat = function() {
			if (forceBeatHandler) {
				beatHandler = forceBeatHandler;
				forceBeatHandler = undefined;
			}
		};

		gamesetupjs.setChatHandler(function(txt) {
			try {
				var obj = JSON.parse(txt);
				if (obj.type === 'vetos' && isHost) {
					opponentVetoMaps = obj.vetos;
					console.log("set opponent vetos");
					console.log(opponentVetoMaps);
				} else {
					console.log("unknown chat message type");
					console.log(obj);
				}
			} catch (e) {
				console.log("failed to parse chat");
				console.log(e);
			}
		});
		
		var heartBeat = function() {
			console.log("heartbeat");
			if (settingupGame()) {
				checkTimeout();
			}

			checkForceBeat();

			if (beatHandler) {
				setTimeout(function() {
					checkForceBeat();
					if (beatHandler) {
						console.log("running beat @ "+new Date().getTime());
						beatHandler(heartBeat);
					} else {
						heartBeat();
					}
				}, 3000);
			} else {
				setTimeout(heartBeat, 1000);
			}
		};

		heartBeat();

		var webserviceFailure = function(error) {
			console.log("webservice error");
			console.log(error);
			bigNotice("webservice error. Is PA Stats offline?");
			setTimeout(function() {
				beatHandler(heartBeat);
			}, 5000);
		};

		gamesetupjs.setFailHandler(function(reason) {
			console.log("gamesetup failed completely due to reason: "+reason);
			bigNotice("failed to setup game: '"+reason+"', will retry vs the same opponent");
			gamesetupjs.setMap(getMap([decode(localStorage[paStatsGlobal.vetoMapName])]));
			forceBeatHandler = function(next) {
				matchmakingjs.resetGameSetup(function() {
					smallNotice("reset game notice sent");
					gamesetupjs.leaveGame(function() {
						smallNotice("left old lobby");
						if (isHost()) {
							prepareServer();
						}
						beatHandler = searchMatchBeat;
						next();
					});
				}, webserviceFailure);
			};
		});

		var checkTimeout = function() {
			console.log("check timeout");
			matchmakingjs.refreshTimeout(function(timeout, resetGame) {
				console.log("timeout = "+timeout+"; resetGame="+resetGame);
				if (timeout || resetGame) {
					forceBeatHandler =  function(next) {
						bigNotice("something unplanned happen, adjusting...");
						gamesetupjs.leaveGame(function() {
							console.log("left game");
							if (timeout) {
								bigNotice("got timeout, opponent left");
								prepareSearch();
							} else if (resetGame && isHost()) {
								smallNotice("opponent asks us to restart the gamesetup");
								prepareServer();
							}
							beatHandler = searchMatchBeat;
							next();
						});
					};
				}
			}, webserviceFailure);
		};

		var searchMatchBeat = function(next) {
			bigNotice("looking for games");
			opponentVetoMaps = undefined; // TODO it is somewhat not very transparent why this has to be here
			checkedVetos = false;
			$.getJSON(paStatsGlobal.queryUrlBase+"minutesTillMatch?ubername="+decode(localStorage['uberName']), function(data) {
				if (searching()) {
					if (data.minutes > -1) {
						var ssss = data.minutes !== 1 ? "s" : "";
						smallNotice("if nobody joins or leaves the pool, you will get a game in ~"+data.minutes+" minute"+ssss);
					} else {
						smallNotice("can't estimate time till match");
					}
				}
			});
			matchmakingjs.register(function(game) {
				if (searching() || settingupGame()) {
					bigNotice("found a game");
					settingupGame(true);
					searching(false);

					isHost(game.isHost);
					if (game.isHost) {
						smallNotice("I am host");
						beatHandler = hostWaitingBeat;
					} else {
						smallNotice("I am client");
						beatHandler = clientLeavePreparedServerBeat;
					}
				}
				next();
			}, next, webserviceFailure);
		};

		var getAllVetos = function() {
			var allVetos = [decode(localStorage[paStatsGlobal.vetoMapName])];

			if (opponentVetoMaps) {
				for(var i = 0; i < opponentVetoMaps.length; i++) {
					allVetos.push(opponentVetoMaps[i]);
				}
			}
			
			return allVetos;
		};
		
		var hasVeto = function() {
			var hasVeto = false;
			var allVetos = getAllVetos();
			
			for (var i = 0; i < allVetos.length; i++) {
				if (allVetos[i] == gamesetupjs.getLoadedMap().name) {
					hasVeto = true;
				}
			}
			
			return hasVeto;
		};
				
		
		/* Client heartbeats */

		var clientLeavePreparedServerBeat = function(next) {
			bigNotice("leaving prepared server to join the other player");
			gamesetupjs.leaveGame(function() {
				smallNotice("left lobby");
				beatHandler = clientJoinBeat;
				next();
			});
		};

		var clientJoinBeat = function(next) {
			bigNotice("looking to join the server of the other player now");
			matchmakingjs.queryLobbyIdOfHost(function(lobbyId) {
				smallNotice("got lobby, joining now");
				gamesetupjs.joinLobby(lobbyId, displayName(), function() {
					smallNotice("joined lobby");
					gamesetupjs.sendChat(JSON.stringify({
						type: 'vetos',
						vetos: [decode(localStorage[paStatsGlobal.vetoMapName])]
					}));
					beatHandler = waitForClientLoadBeat;
					next();
				});
			}, next, webserviceFailure);
		};

		var waitForClientLoadBeat = function(next) {
			bigNotice("waiting for planets to be build");
			if (!hasVeto() && gamesetupjs.myLoadIsComplete()) {
				smallNotice("planets are accepted and build, game should start very soon");
				gamesetupjs.ensureReadyUp();
				// this serves as a check we are in the correct lobby
				matchmakingjs.reportClientIsReadyToStart(gamesetupjs.getLobbyId(), webserviceFailure);
			} else if (hasVeto()) {
				smallNotice("veto: waiting for host to change the map");
			}
			next();
		};

		/* host heartbeats */
		var hostWaitingBeat = function(next) {
			bigNotice("our prepared server will be used")
			if (gamesetupjs.serverCreated()) {
				smallNotice("prepared server is ready");
				matchmakingjs.notifyHosted(gamesetupjs.getLobbyId(), function() {
					smallNotice("notified partner that we are ready for them to join the lobby");
					beatHandler = hostWaitsForStartBeat;
					next();
				}, webserviceFailure)
			}
			next();
		};
		
		var checkVetosProcessed = function(next) {
			if (!checkedVetos && opponentVetoMaps) {
				console.log("check vetos...");
				checkedVetos = true;
				if (hasVeto()) {
					smallNotice("has map veto, changing map...");
					gamesetupjs.changeMap(getMap(getAllVetos()), next);
				} else {
					smallNotice("checked for vetos: no vetos");
					next();
				}
			} else {
				next();
			}
		};
		
		var hostWaitsForStartBeat = function(next) {
			bigNotice("waiting for planets to be build on server and both clients");
			if (checkedVetos && !hasVeto() && gamesetupjs.playersReadyFor1vs1()) {
				smallNotice("everyone is finished loading the planets, starting game now");
				gamesetupjs.startGame();
				beatHandler = undefined;
			}
			checkVetosProcessed(next);
		};

		// end of heartbeats

		var enterSearch = function() {
			if (!searching()) {
				prepareSearch();
				beatHandler = searchMatchBeat;
			}
		};

		var leaveSearch = function() {
			bigNotice("will cancel soon");
			forceBeatHandler = function(next) {
				bigNotice("cancel...");
				beatHandler = undefined;
				matchmakingjs.unregister(function() {
					smallNotice("left queue");
					gamesetupjs.leaveGame(function() {
						smallNotice("left prepared lobby");
						searching(false);
						settingupGame(false);
					});
				}, webserviceFailure);
				next();
			};
		};

		model.startRankedGame = enterSearch;
		model.cancelSearch = leaveSearch;

		model.serverLoaded = gamesetupjs.serverLoaded;
		model.clientLoaded = gamesetupjs.clientLoaded;

	}
}());
