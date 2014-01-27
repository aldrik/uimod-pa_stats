$("#A3").parent().parent().parent().before('<tr><td class="td_start_menu_item" data-bind="click: startRankedGame, visible: showingReady"><div style="margin-top: 8px; margin-right: 10px; font-size: 12px; float: right; display: none" id="pa_stats_players_note">Somebody else<br/>is searching!</div><span class="link_start_menu_item"><a href="#" id="ranked_btt"><span class="start_menu_item_lbl" id ="ranked_text">PA STATS AUTO 1vs1</span>  </a>  </span>  </td> </tr>');

(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	var ladderPassword = "pastatsPleaseDoNotJoinThisGame";
	var pollingSpeed = 3000;
	var queryUrlBase = paStatsGlobal.queryUrlBase;
	
	var makeDescription = function() {
        // TODO: Remove when planets are generated using the new schema
        function fixupPlanetConfig(desc) {
            var planets = desc.system.planets;
            for (var p = 0; p < planets.length; ++p)
            {
                var planet = planets[p];
                if (planet.hasOwnProperty('position_x'))
                {
                    planet.position = [planet.position_x, planet.position_y];
                    delete planet.position_x;
                    delete planet.position_y;
                }
                if (planet.hasOwnProperty('velocity_x'))
                {
                    planet.velocity = [planet.velocity_x, planet.velocity_y];
                    delete planet.velocity_x;
                    delete planet.velocity_y;
                }
                if (planet.hasOwnProperty('planet'))
                {
                    planet.generator = planet.planet;
                    delete planet.planet;
                }
            }
            return desc;
        }
		
        // TODO make this less static
		var system = { "name" : "Ranked System",
			      "planets" : [ { "mass" : 3000,
			            "planet" : { "biome" : "lava",
			                "biomeScale" : 1,
			                "heightRange" : 22,
			                "index" : 0,
			                "name" : "lava",
			                "radius" : 666,
			                "seed" : 1337,
			                "temperature" : 69,
			                "waterHeight" : 10
			              },
			            "position_x" : 20000,
			            "position_y" : 0,
			            "velocity_x" : 0,
			            "velocity_y" : 158.114
			          },
			          { "mass" : 3000,
			            "planet" : { "biome" : "lava",
			                "biomeScale" : 1,
			                "heightRange" : 33,
			                "index" : 0,
			                "name" : "lava",
			                "radius" : 300,
			                "seed" : 15497,
			                "temperature" : 57,
			                "waterHeight" : 37
			              },
			            "position_x" : 24000,
			            "position_y" : 0,
			            "velocity_x" : 0,
			            "velocity_y" : 219.351
			          }
			        ]
			    };
		
		var result = { "armies" : [ { "slots" : [ "player" ] },
	                    { "slots" : [ "player" ] } ],
	                      "blocked" : [  ],
	            		  "enable_lan" : false,
	            		  "friends" : [  ],
	            		  "password" : ladderPassword,
	            		  "spectators" : 0,
	            		  "system" : system,
	            		  "type" : 0
            			};
		
		fixupPlanetConfig(result);
		
		return result;
	};
	
	var setText = function(txt) {
		console.log(txt);
		$("#msg_progress").text(txt);
	}
	
	var showCancelBtt = function() {
		$("#connecting").dialog("option", "buttons", {
			"CANCEL": function() {
            	cancel();
            	$(this).dialog("close");
            }
		});		
	}
	
	var showLoad = function() {
        $("#connecting").dialog({
            dialogClass: "signin_notification",
            draggable: false,
            resizable: false,
            height: 120,
            width: 600,
            modal: true,
            buttons: {}
        });
        showCancelBtt();
	}
	
	var hideCancelBtt = function() {
		$("#connecting").dialog("option", "buttons", {	
		});
	}

	var cancelLoops = false;
	var searching = false;
	
	var cancelLoop = function() {
		cancelLoops = false;
		unregister();
	};
	
	var lobbyIdObs = ko.observable().extend({ session: 'lobbyId' });
	lobbyIdObs.subscribe(function(v) {
		localStorage['lobbyId'] = encode(v);
	});
	
	var writeDescription = function() {
		var desc = makeDescription();
        model.send_message('game_config', desc, function(success) {
            if (!success) {
            	setText("setting planets failed");
            	reset();
            }
        });
	}
	
	var iAmHost = false;
	
	var notifyHosted = function(gameId) {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "gameHosted",
			contentType : "application/json",
			data: JSON.stringify({uber_name: model.uberName(), game_id: gameId}),
			error: function (data) {
				setText("webservice error");
				reset();
			}
		});
	}
	
	var connectToServer = function() {
		setText("connecting to game...");
        engine.call('join_game',
                String(model.gameHostname()),
                Number(model.gamePort()),
                String(model.displayName()),
                String(model.gameTicket()),
                String(JSON.stringify({ password: ladderPassword })));
	}
	
	var publishAGame = function() {
		setText("publish game...");
		iAmHost = true;
		console.log("use region: " + model.uberNetRegion());
        engine.asyncCall("ubernet.startGame", model.uberNetRegion(), 'Config').done(function (data) {
            data = JSON.parse(data);

            setText("ubernet created game, gonna connect now...");
           
            model.gameTicket(data.Ticket);
            model.gameHostname(data.ServerHostname);
            model.gamePort(data.ServerPort);
            
            lobbyIdObs(data.LobbyID);
            
            connectToServer();
        }).fail(function (data) {
        	setText("failed to start ubernet game");
        	reset();
        });
	}
	
	var toggleReady = function() {
		model.send_message('toggle_ready', undefined, function(success) {
            setText("Ready: waiting for other players...");
        });
	};
	
	var runHostWaitLoop = function() {
		setText("waiting for other player to join...");
		$.ajax({
			type : "POST",
			url : queryUrlBase + "shouldStartServer",
			contentType : "application/json",
			data: JSON.stringify({uber_name: model.uberName(), game_id: lobbyIdObs()}),
			success: function(result) {
				if (result.shouldStart) {
					toggleReady(); // TODO this might be better off server side
					window.setTimeout(window.setTimeout(function() {
						setText("timeout");
						reset();
					}, 20000));
				} else if (result.hasTimeOut) {
					setText("got timeout");
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(runHostWaitLoop, pollingSpeed);						
					} else {
						cancelLoop()
					}
				}
			},
			error: function(r) {
				model.registerForSearch();
			}
		});
	};
	
	var joinGame = function(lobbyId) {
		setText("join ubernet game...");
		
        engine.asyncCall("ubernet.joinGame", lobbyId).done(function (data) {
            data = JSON.parse(data);
            
            if (data.PollWaitTimeMS) {
            	window.setTimeout(function() {
            		joinGame(lobbyId);
            	}, data.PollWaitTimeMs);
            } else {
                model.isLocalGame(false);
                model.gameTicket(data.Ticket);
                model.gameHostname(data.ServerHostname);
                model.gamePort(data.ServerPort);
                lobbyIdObs(lobbyId);
                setText("ubernet game join successful, will connect now");
                connectToServer();
            }
        }).fail(function (data) {
        	setText("failed to join ubernet game");
            reset();
        });
	}
	
	var waitForHost = function() {
		setText("waiting for host...");
		$.ajax({
			type : "GET",
			url : queryUrlBase + "pollGameId?ubername="+model.uberName(),
			contentType : "application/json",
			success : function(result) {
				if (result.serverCreated) {
					joinGame(result.lobbyId);
				} else if (result.hasTimeOut) {
					setText("timeout while waiting for host...");
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(waitForHost, pollingSpeed);						
					} else {
						cancelLoop();
					}
				}
			},
			error: function (r) {
				model.registerForSearch();
			}
		});
	}
	
	var reportClientIsReadyToStart = function() {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "readyToStart",
			contentType : "application/json",
			data: JSON.stringify({uber_name: model.uberName(), game_id: lobbyIdObs()}),
			success: function(result) {
				if (result.hasTimeOut) {
					setText("timeout...");
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(reportClientIsReadyToStart, pollingSpeed);						
					} else {
						cancelLoop();
					}
				}
			},
			error: function(r) {
				setText("webservice error");
				reset();
			}
		});
	}
	
	var registerForSearch = function() {
		setText("searching 1v1 vs other PA Stats users...");
		$.ajax({
			type : "POST",
			url : paStatsGlobal.queryUrlBase + "register",
			contentType : "application/json",
			data: JSON.stringify({
				uber_name: model.uberName(),
				game_id: ""
			}),
			complete : function() {
				if (searching && !cancelLoops) {
					// keep polling the server to signal further interest
					setTimeout(pollHasGame, pollingSpeed * 2);
				} else {
					cancelLoop();
				}
			},
			error: function() {
				setText("webservice error");
            	reset();
			}
		});
	}
	
	var handleFoundGame = function(data) {
		hideCancelBtt();
		if (data.isHost) {
			publishAGame();
		} else {
			waitForHost();
		}
	};
	
	var pollHasGame = function() {
		$.ajax({
			type : "POST",
			url : paStatsGlobal.queryUrlBase + "hasGame",
			contentType : "application/json",
			data: JSON.stringify({
				uber_name: model.uberName(),
				game_id: ""
			}),
			success : function(data) {
				if (data.hasGame) {
					searching = false;
					handleFoundGame(data);
				} else {
					registerForSearch();
				}
			},
			error: function (data) {
				setText("webservice error");
				reset();
			}
		});
	};

	
	var joinSlot = function(slot) {
		var acu = '/pa/units/commanders/quad_base/quad_base.json'; // TODO make this cool and dynamic
		model.send_message("join_army", {army: slot, commander: acu})
	}
	
	model.startRankedGame = function() {
 		engine.call('disable_lan_lookout');
		showLoad();
		reset();
		setText("starting search...");
	};
	
	var unregister = function() {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "unregister",
			contentType : "application/json",
			data: JSON.stringify({
				uber_name: model.uberName(),
				game_id: ""
			}),
		});
	}
	
	var reset = function() {
		localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
		unregister();
		engine.call('reset_game_state');
		showCancelBtt();
		window.setTimeout(function() {
			searching = true;
			pollHasGame();
		}, pollingSpeed);
	}
	
	var cancel = function() {
		engine.call('reset_game_state');
		cancelLoops = true;
		searching = false;
		unregister();
	}
	
	
	
	handlers.login_accepted = function(payload) {
		setText("login accepted...");
		app.hello(handlers.server_state, handlers.connection_disconnected);
	};
	
	handlers.connection_failed = function(payload) {
		setText("connection failed");
		reset();
	};
	
	handlers.connection_disconnected = function(payload) {
		setText("connection disconnected");
		reset();
	};
	
	handlers.login_rejected = function(payload) {
		setText("login rejected");
		reset();
	};
	
	var loadPlanet = ko.observable({}).extend({ local: 'pa_stats_loaded_planet' });

	var setPaStatsTeams = function() {
		localStorage[paStatsGlobal.pa_stats_session_team_index] = encode(iAmHost ? 0 : 1);
		
		var teams = [
		  {
			  index: 0,
			  primaryColor: latestArmies["0"].primary_color,
			  secondaryColor: latestArmies["0"].secondary_color,
			  players: [{displayName: latestArmies["0"].slots[0]}],
		  },
		  {
			  index: 1,
			  primaryColor: latestArmies["1"].primary_color,
			  secondaryColor: latestArmies["1"].secondary_color,
			  players: [{displayName: latestArmies["1"].slots[0]}],		 
		  }
		];
		
		localStorage[paStatsGlobal.pa_stats_session_teams] = encode(teams);
	};
	
	var latestArmies = undefined;
	handlers.army_state = function(army) {
		latestArmies = army;
	}

	handlers.server_state = function(msg) {
	    // TODO: Remove when planets are parsed using the new schema
	    function adaptServerGameConfig(desc) {
	        var planets = desc.system.planets;
	        for (var p = 0; p < planets.length; ++p)
	        {
	            var planet = planets[p];
	            if (planet.hasOwnProperty('position'))
	            {
	                planet.position_x = planet.position[0];
	                planet.position_y = planet.position[1];
	                delete planet.position;
	            }
	            if (planet.hasOwnProperty('velocity'))
	            {
	                planet.velocity_x = planet.velocity[0];
	                planet.velocity_y = planet.velocity[1];
	                delete planet.velocity;
	            }
	            if (planet.hasOwnProperty('generator'))
	            {
	                planet.planet = planet.generator;
	                delete planet.generator;
	            }
	        }
	        return desc;
	    }
		
		function createSimplePlanet(system) {
			var simpleplanet = {
				seed: system.planets[0].planet.seed,
				temperature: system.planets[0].planet.temperature,
				waterHeight: system.planets[0].planet.waterHeight,
				heightRange: system.planets[0].planet.heightRange,
				radius: system.planets[0].planet.radius,
				biome: system.planets[0].planet.biome,
				name: system.name
			}
			return simpleplanet;
		}	

		if (msg.state === "landing") { // this happens when the game moves into the live_game.js
			localStorage[paStatsGlobal.isRankedGameKey] = encode(true);
			setPaStatsTeams();
			// we are done after this
			window.location.href = msg.url;
		} else if (msg.state === "lobby") { // happens when connect to game is complete
			if (msg.data) {
				loadPlanet(createSimplePlanet(adaptServerGameConfig(msg.data.game).system));
			}
			
			setText("join slot...");
			if (!iAmHost) {
				joinSlot(1);
				toggleReady();
				reportClientIsReadyToStart();
			} else {
				joinSlot(0);
				notifyHosted(lobbyIdObs());
				runHostWaitLoop();
			}
		} else if (msg.state === "config") { // happens when we can config the game (new_game scene)
			if (iAmHost) {
				setText("configure planets...");
				writeDescription();
			}
		}
	};
	
	var checkIfPlayersAvailable = function() {
		$.ajax({
			type : "GET",
			url : queryUrlBase + "hasPlayersSearching",
			contentType : "application/json",
			success : function(result) {
				if (result.hasPlayers) {
					$("#pa_stats_players_note").show();
				} else {
					$("#pa_stats_players_note").hide();
				}
				setTimeout(checkIfPlayersAvailable, pollingSpeed)
			}
		});
	};
	checkIfPlayersAvailable();
})();

