(function() {

	// ubernet build version should be the non pte version, so this actually
	// checks "are we on the current official public live build or are we in a
	// test environment" :)
	if (decode(sessionStorage['ubernet_build_version']) == decode(sessionStorage['build_version'])  || (typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined')) {
	
		var refreshingTimeout = false;
		var searching = ko.observable(false);
		var settingupGame = ko.observable(false);
		var isHost = ko.observable(false);	
		
		$('.section_controls > div:nth-child(1)').after('<a href="#" class="btn_std" style="width: 100%" data-bind="click: startRankedGame, click_sound: \'default\', rollover_sound: \'default\' ">'+
				'<div class="btn_label">'+
				'    PA STATS 1vs1'+
				'</div>'+
							'</a>');
		
		$('.div_commit_cont').prepend('<div style="font-size: 20px;padding-right: 100px;display: none;" id="pa_stats_players_note"></div>');
		
		var closeNote = "Someone close to your skill level is searching 1vs1 via PA Stats";
		var notCloseNote = "Another player is searching 1vs1 via PA Stats";
		
		paStatsGlobal.checkIfPlayersAvailable("#pa_stats_players_note", function() {
			$.getJSON(paStatsGlobal.queryUrlBase+"minutesTillMatch?ubername="+localStorage['uberName'], function(data) {
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
		
		$('.title').text("Multiplayer with 1vs1 ranked games by pa stats (new maps, better code!)");	
		
		// remove stupid cpu intensive glow stuff, we will need cpu power to load
		// planets
		$('.title_watermark').remove();
		$('.background_glow').remove();
		
	    $('body').append(
	    		'<div id="searchingPaStatsGame" class="ui-dialog-content ui-widget-content" style="display: none;">'+
	    			'<div class="div_alert" style="height: 92%" >' +
	    			'<img src="coui://ui/main/shared/img/loading.gif" class="img_progress_icon" style="margin:0px 8px 0px 0px"></img>'+
	    			'<div id="msg_progress_pa_stats" class="msg_progress_icon"></div><div id="small_msg_progress_pa_stats"></div>'+ 
	    			"<div id='ytholder'></div>"+'</div>'+
	    			"<div><span data-bind='if: model.serverLoaded'>Server ready</span> <span data-bind='if: model.clientLoaded'>Client ready</span></div>"+
	    		'</div>'
	    );
		
		var hideCancelBtt = function() {
			console.log("hide cancel btt");
			$("#searchingPaStatsGame").dialog("option", "buttons", {	
			});
		}    
	    
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
		}	
		
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
		gamesetupjs.setMap(pa_stats_mappool[Math.floor(Math.random() * pa_stats_mappool.length)]);
	
		var setPaStatsTeams = function() {
			var latestArmies = gamesetupjs.getLatestArmies();
			
			localStorage[paStatsGlobal.pa_stats_session_team_index] = encode(latestArmies[0].name == uberName() || latestArmies[0].name == displayName() ? 0 : 1);
			
			var p0 = latestArmies[0].primary_color;
			var s0 = latestArmies[0].secondary_color;
			
			var p1 = latestArmies[1].primary_color;
			var s1 = latestArmies[1].secondary_color;
			
			var teams = [
			  {
				  index: 0,
				  primaryColor: "rgb("+p0[0]+","+p0[1]+","+p0[2]+")",
				  secondaryColor: "rgb("+s0[0]+","+s0[1]+","+s0[2]+")",
				  players: [{displayName: latestArmies[0].name}],
			  },
			  {
				  index: 1,
				  primaryColor: "rgb("+p1[0]+","+p1[1]+","+p1[2]+")",
				  secondaryColor: "rgb("+s1[0]+","+s1[1]+","+s1[2]+")",
				  players: [{displayName: latestArmies[1].name}],
			  }
			];
			
			localStorage[paStatsGlobal.pa_stats_session_teams] = encode(teams);
		};
		
		gamesetupjs.setLandingHandler(function(lander) {
			smallNotice("configure pa stats data...");
			localStorage['pa_stats_loaded_planet_json'] = JSON.stringify(gamesetupjs.getLoadedMap());
			localStorage[paStatsGlobal.isRankedGameKey] = encode(true);
			localStorage['lobbyId'] = encode(gamesetupjs.getLobbyId());
			setPaStatsTeams();
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
			if (v) {
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
			$.getJSON(paStatsGlobal.queryUrlBase+"minutesTillMatch?ubername="+decode(localStorage['uberName']), function(data) {
				if (searching()) {
					if (data.minutes > -1) {
						var ssss = data.minutes > 1 ? "s" : "";
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
					beatHandler = waitForClientLoadBeat;
					next();
				});
			}, next, webserviceFailure);
		};
		
		var waitForClientLoadBeat = function(next) {
			bigNotice("waiting for planets to be build");
			if (gamesetupjs.myLoadIsComplete()) {
				smallNotice("planets are build, reporting we are ready to host, game should start very soon");
				matchmakingjs.reportClientIsReadyToStart(gamesetupjs.getLobbyId(), webserviceFailure);
			}
			next();
		};
		
		/* host heartbeats */
		var hostWaitingBeat = function(next) {
			bigNotice("our prepared server will be used")
			if (gamesetupjs.serverCreated()) {
				smallNotice("prepared server is ready");
				matchmakingjs.notifyHosted(gamesetupjs.getLobbyId(), function() {
					smallNotice("notified partner that we are ready for him to join the lobby");
					beatHandler = hostWaitsForStartBeat;
					next();
				}, webserviceFailure)
			}
			next();
		};
		
		var hostWaitsForStartBeat = function(next) {
			bigNotice("waiting for planets to be build on server and both clients");
			matchmakingjs.queryShouldStartServer(gamesetupjs.getLobbyId(), function() {
				smallNotice("our partner reports he is finished loading the planets");
				if (gamesetupjs.myLoadIsComplete()) {
					smallNotice("everyone is finished loading the planets, starting game now");
					gamesetupjs.startGame();
					beatHandler = undefined;
				}
				next();
			}, next, webserviceFailure);
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