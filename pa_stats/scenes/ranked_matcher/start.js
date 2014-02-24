$("#A3").parent().parent().parent().before('<tr><td class="td_start_menu_item" data-bind="click: startRankedGame, visible: showingReady"><div style="margin-top: 8px; margin-right: 10px; font-size: 12px; float: right; display: none" id="pa_stats_players_note">Somebody else<br/>is searching!</div><span class="link_start_menu_item"><a href="#" id="ranked_btt"><span class="start_menu_item_lbl" id ="ranked_text">PA STATS AUTO 1vs1</span>  </a>  </span>  </td> </tr>');

(function() {
	localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
	var ladderPassword = "pastatsPleaseDoNotJoinThisGame";
	var pollingSpeed = paStatsGlobal.pollingSpeed;
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
		
        var mappool = [
   {
	      "name": "RedD",
	      "planets": [
	         {
	            "name": "R2D666",
	            "mass": 2500,
	            "position_x": 20135.1,
	            "position_y": -24.0562,
	            "velocity_x": 0.188263,
	            "velocity_y": 157.582,
	            "planet": {
	               "seed": 7846,
	               "radius": 720,
	               "heightRange": 77,
	               "waterHeight": 40,
	               "temperature": 100,
	               "metalDensity": 50,
	               "metalClusters": 50,
	               "biomeScale": 23,
	               "biome": "lava"
	            }
	         }
	      ]
	   },
	   {
	      "name": "A1600",
	      "planets": [
	         {
	            "name": "1400866",
	            "mass": 1800,
	            "position_x": 15012.4,
	            "position_y": -13515.5,
	            "velocity_x": -105.267,
	            "velocity_y": -116.925,
	            "planet": {
	               "seed": 17753,
	               "radius": 670,
	               "heightRange": 65,
	               "waterHeight": 30,
	               "temperature": 65,
	               "metalDensity": 50,
	               "metalClusters": 50,
	               "biomeScale": 57,
	               "biome": "earth"
	            }
	         }
	      ]
	   },
	   {
	      "name": "Winter Duel",
	      "planets": [
	         {
	            "mass": 2000,
	            "name": "Winter Duel",
	            "planet": {
	               "biome": "earth",
	               "biomeScale": 50,
	               "heightRange": 8,
	               "metalClusters": 50,
	               "metalDensity": 50,
	               "radius": 375,
	               "seed": 13295,
	               "temperature": 0,
	               "waterHeight": 35
	            },
	            "position_x": 22564.8,
	            "position_y": -6463.92,
	            "velocity_x": -40.1926,
	            "velocity_y": -140.308
	         }
	      ]
	   },
	   {
	      "name": "Open Palms",
	      "planets": [
	         {
	            "mass": 1800,
	            "name": "Open Palms",
	            "planet": {
	               "biome": "earth",
	               "biomeScale": 50,
	               "heightRange": 50,
	               "metalClusters": 50,
	               "metalDensity": 50,
	               "radius": 900,
	               "seed": 3348,
	               "temperature": 57,
	               "waterHeight": 33
	            },
	            "position_x": 28682.5,
	            "position_y": -545.396,
	            "velocity_x": 2.50988,
	            "velocity_y": 131.995
	         }
	      ]
	   },
	   {
	      "name": "Finns Revenge",
	      "planets": [
	         {
	            "mass": 2100,
	            "name": "Finns Revenge",
	            "planet": {
	               "biome": "tropical",
	               "biomeScale": 50,
	               "heightRange": 7,
	               "metalClusters": 50,
	               "metalDensity": 50,
	               "radius": 599,
	               "seed": 11375,
	               "temperature": 80,
	               "waterHeight": 34
	            },
	            "position_x": 19610,
	            "position_y": -12317.2,
	            "velocity_x": 78.1559,
	            "velocity_y": 124.431
	         }
	      ]
	   },
	   {
	      "name": "Fields of Isis",
	      "planets": [
	         {
	            "mass": 1000,
	            "name": "Fields of Isis",
	            "planet": {
	               "biome": "moon",
	               "biomeScale": 50,
	               "heightRange": 75,
	               "metalClusters": 50,
	               "metalDensity": 50,
	               "radius": 653,
	               "seed": 28151,
	               "temperature": 0,
	               "waterHeight": 5
	            },
	            "position_x": 13775.9,
	            "position_y": -16516.4,
	            "velocity_x": 117.09,
	            "velocity_y": 97.6618
	         }
	      ]
	   },
	   {
	      "name": "Painted Desert",
	      "planets": [
	         {
	            "mass": 1800,
	            "name": "Painted Desert",
	            "planet": {
	               "biome": "earth",
	               "biomeScale": 50,
	               "heightRange": 21,
	               "metalClusters": 50,
	               "metalDensity": 50,
	               "radius": 1050,
	               "seed": 3348,
	               "temperature": 100,
	               "waterHeight": 33
	            },
	            "position_x": 29560.5,
	            "position_y": -20109.9,
	            "velocity_x": 66.5178,
	            "velocity_y": 97.7777
	         }
	      ]
	   }
	];
        
        var systemN = Math.floor(Math.random() * mappool.length);
		var system = mappool[systemN]; 
		
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
	
	var refreshTimeout = function(callback, failcb) {
		$.get(queryUrlBase+"resetMyTimeout?ubername="+model.uberName(), function() {
			if (callback) {
				callback();
			}
		}).fail(function() {
			if (failcb) {
				failcb();
			}
		});
	}
	
	var setText = function(txt) {
		console.log(txt);
		$("#msg_progress").text(txt);
	}
	
	var getAndStoreVideoId = function() {
    	var customVideo = $('#gamefoundvideo').val();
    	console.log(customVideo);
    	if (customVideo && customVideo.length && customVideo.length > 0) {
    		localStorage['info.nanodesu.warnVideoId'] = customVideo;
    	} else {
    		delete localStorage['info.nanodesu.warnVideoId'];
    	}
		return customVideo;
	};
	
	var showCancelBtt = function() {
		$("#connecting").dialog("option", "buttons", {
			"CANCEL": function() {
            	cancel();
            	getAndStoreVideoId();
            	$('#youtubeconfig').remove();
            	$('#youtubewarning').remove();
        		
            	$(this).dialog("close");
            }
		});
	}
	
	var showLoad = function() {
		var warnId = localStorage['info.nanodesu.warnVideoId'];
		if (warnId === undefined) {
			warnId = "";
		}
		$('#connecting').append("<div id='youtubeconfig' style='display: table; margin 0 auto;'><input value='"+warnId+"' style='width: 650px;' id='gamefoundvideo' type='text' placeholder='yt video id for custom video, i.e. 9V1eOKhYDws'/></div>");
        $("#connecting").dialog({
            dialogClass: "signin_notification",
            draggable: false,
            resizable: false,
            height: 340,
            width: 700,
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
	
	var loaded = false;
	var serverLoaded = false;
	
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
					waitForLoadLoop(function() {
						toggleReady();
						window.setTimeout(function() {
							setText("timeout while loading, but all players were ready?!");
							reset();
						}, 180000);
					});
				} else if (result.hasTimeOut) {
					setText("got timeout");
					reset();
				} else {
					if (!cancelLoops) {
						setTimeout(runHostWaitLoop, pollingSpeed);						
					} else {
						cancelLoop();
					}
				}
			},
			error: function(r) {
				model.registerForSearch();
			}
		});
	};
	
	var joinGame = function(lobbyId) {
		setText("join ubernet game... ");
		refreshTimeout();
		
        engine.asyncCall("ubernet.joinGame", lobbyId).done(function (data) {
            data = JSON.parse(data);
            
            if (data.PollWaitTimeMS) {
            	window.setTimeout(function() {
            		joinGame(lobbyId);
            	}, 5000);
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
		setText("searching 1vs1 vs other PA Stats users... The game will play a youtube video, even when minimized. Enter a custom video id here:");

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
		var defVideo = "9V1eOKhYDws";
		var customVideo = getAndStoreVideoId();
		
		var v = customVideo && customVideo.length && customVideo.length > 0 ? customVideo : defVideo;
		
		$('#youtubeconfig').remove();
		$('#connecting').append('<div style="display: table; margin: 0 auto;" id="youtubewarning"><iframe width="300" height="200" src="http://www.youtube.com/embed/'+v+'?autoplay=1" frameborder="0"></iframe></div>');		
		
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
		loaded = false;
		serverLoaded = false;
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
		loaded = false;
		serverLoaded = false;
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
	
	var waitForLoadLoop = function(callback) {
		var loadFinished = loaded /*&& serverLoaded*/;
		if (!loadFinished) {
			setText("waiting for the game to load");
		}
		refreshTimeout(function() {
			if (cancelLoops) {
				cancelLoop();
			} else if (loadFinished) {
				callback();
			} else {
				setTimeout(function() {waitForLoadLoop(callback);}, pollingSpeed);
			}
		}, function() {
			setText("webservice error");
			reset();
		});
	}
	
	// this seems not to work reliably?!
	handlers.lobby_state = function(msg) {
		serverLoaded = msg.sim_ready;
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
			
			api.getWorldView(0).whenPlanetsReady().done(function() {
				loaded = true;
			});
			
			setText("join slot...");
			if (!iAmHost) {
				joinSlot(1);
				toggleReady();
				waitForLoadLoop(function() {
					reportClientIsReadyToStart();
				});
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
	
	paStatsGlobal.checkIfPlayersAvailable("#pa_stats_players_note");
})();

