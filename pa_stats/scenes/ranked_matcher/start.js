$("#A3").parent().parent().parent().before('<tr><td class="td_start_menu_item" data-bind="click: startRankedGame, visible: showingReady"><span class="link_start_menu_item"><a href="#" id="ranked_btt"><span class="start_menu_item_lbl" id ="ranked_text">PA STATS 1v1</span> </a>  </span> </td> </tr>');

(function() {
	var ladderPassword = "pastats";
	var pollingSpeed = 2500;
	
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
	
	var showLoad = function() {
        $("#connecting").dialog({
            dialogClass: "signin_notification",
            draggable: false,
            resizable: false,
            height: 150,
            width: 400,
            modal: true,
            buttons: {"CANCEL": function() {
            	cancel();
            	$(this).dialog("close");
            }}
        });
	}
	

	var cancelLoops = false;
	var searching = false;
	
	var lobbyIdObs = ko.observable().extend({ session: 'lobbyId' });
	lobbyIdObs.subscribe(function(v) {
		localStorage['lobbyId'] = encode(v);
	});
	
	var writeDescription = function() {
		var desc = makeDescription();
        model.send_message('game_config', desc, function(success) {
            if (!success) {
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
				console.log(data);
				reset();
			}
		});
	}
	
	var connectToServer = function() {
        engine.call('join_game',
                String(model.gameHostname()),
                Number(model.gamePort()),
                String(model.displayName()),
                String(model.gameTicket()),
                String(JSON.stringify({ password: ladderPassword })));
	}
	
	var publishAGame = function() {
		setText("creating game...");
		iAmHost = true;
		console.log("use region: " + model.uberNetRegion());
        engine.asyncCall("ubernet.startGame", model.uberNetRegion(), 'Config').done(function (data) {
            data = JSON.parse(data);

            setText("ubernet created game, gonna join now...");
           
            model.gameTicket(data.Ticket);
            model.gameHostname(data.ServerHostname);
            model.gamePort(data.ServerPort);
            
            lobbyIdObs(data.LobbyID);
            
            connectToServer();
        }).fail(function (data) {
        	console.log(data);
        	reset();
        });
	}
	
	var toggleReady = function() {
		model.send_message('toggle_ready', undefined, function(success) {
            console.log("toggle ready result: "+success);
            setText("ready up...");
        });
	};
	
	var runHostWaitLoop = function() {
		$.ajax({
			type : "POST",
			url : queryUrlBase + "shouldStartServer",
			contentType : "application/json",
			data: JSON.stringify({uber_name: model.uberName(), game_id: lobbyIdObs()}),
			success: function(result) {
				if (result.shouldStart) {
					toggleReady();
				} else if (result.hasTimeOut) {
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(runHostWaitLoop, pollingSpeed);						
					} else {
						cancelLoops = false;
					}
				}
			},
			error: function(r) {
				model.registerForSearch();
			}
		});
	};
	
	var joinGame = function(lobbyId) {
		setText("join game...");
		
        engine.asyncCall("ubernet.joinGame", lobbyId).done(function (data) {
            data = JSON.parse(data);
            
            if (data.PollWaitTimeMS) {
            	window.setTimeout(function() {
            		setText("got a mystery PollWaitTimeMS, let's wait...");
            		joinGame(lobbyId);
            	}, data.PollWaitTimeMs);
            } else {
                model.isLocalGame(false);
                model.gameTicket(data.Ticket);
                model.gameHostname(data.ServerHostname);
                model.gamePort(data.ServerPort);
                lobbyIdObs(lobbyId);
                setText("ubernet join successful, will connect now");
                connectToServer();
            }
        }).fail(function (data) {
            console.log('join game:fail');
            console.log(data);
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
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(waitForHost, pollingSpeed);						
					} else {
						cancelLoops = false;
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
			error: function(r) {
				console.log(r);
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
					cancelLoops = false;
				}
			},
			error: function() {
            	reset();
			}
		});
	}
	
	var handleFoundGame = function(data) {
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
				setText("error while searching, will retry soon...");
				window.setTimeout(pollHasGame, pollingSpeed * 3);
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
	
	var reset = function() {
		engine.call('reset_game_state');
		window.setTimeout(function() {
			searching = true;
			pollHasGame();
		}, pollingSpeed);
	}
	
	var cancel = function() {
		engine.call('reset_game_state');
		cancelLoops = true;
		searching = false;
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
	
	handlers.login_accepted = function(payload) {
		setText("connected to a server...");
		app.hello(handlers.server_state, handlers.connection_disconnected);
	};
	
	handlers.connection_failed = function(payload) {
		console.log("con failed");
		console.log(payload);
		reset();
	};
	
	handlers.connection_disconnected = function(payload) {
		console.log("con disconnected");
		console.log(payload);
		reset();
	};
	
	handlers.login_rejected = function(payload) {
		console.log("login rejected!");
		console.log(payload);
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
	    
		console.log("here is something cool:");
		console.log(msg);
		if (msg.state === "landing") { // this happens when the game moves into the live_game.js
			setPaStatsTeams();
			// we are done after this
			window.location.href = msg.url;
		} else if (msg.state === "lobby") { // happens when connect to game is complete
			if (msg.data) {
				console.log("will set system for pa stats now...");
				loadPlanet(createSimplePlanet(adaptServerGameConfig(msg.data.game).system));
			}
			
			setText("join lobby...");
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
				writeDescription();
			}
		}
	};
})();

