// This code is a mess. It's temporary. I hope Uber releases a proper ladder before I have to clean this up.
// gamma broke it, I hacked it to "work" again. This is somehow rather ugly...
$('#navigation_items').append('<a href="#" class="nav_item" data-bind="click: startRankedGame, click_sound: \'default\', rollover_sound: \'default\', css: { nav_item_disabled: !allowNewOrJoinGame() } ">'+
		'<div style="margin-top: 8px; margin-right: 10px; font-size: 12px; float: right; display: none" id="pa_stats_players_note">You or somebody else<br/>is searching!</div>'+
		'<span class="nav_item_text" data-bind="css: { nav_item_text_disabled: !allowNewOrJoinGame() }">'+
		'    PA STATS AUTO 1vs1'+
		'</span>'+
		'</a>');


(function() {
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
        	   "name": "Single Desert",
        	   "planets": [
        	      {
        	         "name": "Oasis",
        	         "mass": 10000,
        	         "position_x": -13035.2,
        	         "position_y": 34765.3,
        	         "velocity_x": -108.659,
        	         "velocity_y": -40.7416,
        	         "planet": {
        	            "seed": 3348,
        	            "radius": 885,
        	            "heightRange": 23,
        	            "waterHeight": 50,
        	            "temperature": 100,
        	            "metalDensity": 50,
        	            "metalClusters": 50,
        	            "biomeScale": 73,
        	            "biome": "earth"
        	         }
        	      }
        	   ],
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
	               "radius": 666,
	               "seed": 12375,
	               "temperature": 80,
	               "waterHeight": 100
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
		
		var result = { 
              "blocked" : [  ],
    		  "enable_lan" : false,
    		  "friends" : [  ],
    		  "password" : ladderPassword,
    		  "spectators" : 0,
    		  "system" : system,
    		  "type" : "0",
    		  "public" : true,
		};
		loadPlanet(createSimplePlanet(system));
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
		if (!startedLoading) {
			console.log(txt);
			$("#msg_progress_pa_stats").text(txt);
		} else {
			console.log("loading started, ignoring further progress completely:");
			console.log(txt);
		}
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
		$("#searchingPaStatsGame").dialog("option", "buttons", {
			"CANCEL": function() {
            	cancel();
            	getAndStoreVideoId();
            	$('#youtubeconfig').remove();
            	$('#youtubewarning').remove();
        		
            	$(this).dialog("close");
            }
		});
	}
	
    $('body').append(
    		'<div id="searchingPaStatsGame">'+
    			'<div class="div_alert" >' +
    			'<img src="../shared/img/loading.gif" class="img_progress_icon" style="margin:0px 8px 0px 0px"></img><div id="msg_progress_pa_stats" class="msg_progress_icon"></div>'+ 
    			'</div>'+
    		'</div>'
    );
	
	var showLoad = function() {
		var warnId = localStorage['info.nanodesu.warnVideoId'];
		if (warnId === undefined) {
			warnId = "";
		}
		$('#youtubeconfig').remove();
		$('#searchingPaStatsGame').append("<div id='youtubeconfig' style='display: table; margin 0 auto;'><input value='"+warnId+"' style='width: 650px;' id='gamefoundvideo' type='text' placeholder='yt video id for custom video, i.e. 9V1eOKhYDws'/></div>");
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
        showCancelBtt();
	}
	
	var hideCancelBtt = function() {
		$("#searchingPaStatsGame").dialog("option", "buttons", {	
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
		
        model.send_message('reset_armies', [
         { slots: 1, ai: false, alliance: false },
         { slots: 1, ai: false, alliance: false }
       ]);		
		
        model.send_message('modify_settings', desc);
        
        model.send_message('update_game_config', desc, function(success) {
            if (!success) {
            	setText("setting planets failed");
            	$('#youtubewarning').remove();
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
				$('#youtubewarning').remove();
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
		setText("toggle ready...");
		model.send_message('toggle_ready');
	}
	
	var startGame = function() {
		model.send_message('start_game', undefined, function(success) {
			// yes we do this like twice
			// yes the 2nd fails
			// whatever...
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
						var handle = setInterval(refreshTimeout, pollingSpeed);
						startGame();
						window.setTimeout(function() {
							clearInterval(handle);
							setText("timeout while loading, but all players were ready?!");
							reset();
						}, 180000);
					});
				} else if (result.hasTimeOut) {
					setText("got timeout");
					$('#youtubewarning').remove();
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
		refreshTimeout();
		setText("join now...");
        engine.asyncCall("ubernet.joinGame", lobbyId).done(function (data) {
            data = JSON.parse(data);
            console.log(data);
            if (data.PollWaitTimeMS) {
            	window.setTimeout(function() {
            		joinGame(lobbyId);
            	}, 5000);
            } else {
    	 		engine.call('disable_lan_lookout');
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
        	$('#youtubewarning').remove();
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
					$('#youtubewarning').remove();
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
					$('#youtubewarning').remove();
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
				$('#youtubewarning').remove();
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
				$('#youtubewarning').remove();
            	reset();
			}
		});
	}

	var handleFoundGame = function(data) {
		var defVideo = "9V1eOKhYDws";
		var customVideo = getAndStoreVideoId();
		
		var v = customVideo && customVideo.length && customVideo.length > 0 ? customVideo : defVideo;
		
		$('#youtubeconfig').remove();
		$('#youtubewarning').remove();
		$('#searchingPaStatsGame').append('<div style="display: table; margin: 0 auto;" id="youtubewarning"><iframe width="300" height="200" src="http://www.youtube.com/embed/'+v+'?autoplay=1" frameborder="0"></iframe></div>');		
		
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
				$('#youtubewarning').remove();
				reset();
			}
		});
	};

	
	var joinSlot = function(slot) {
		model.send_message("join_army", {
			army: slot,
			commander: {
				ObjectName: model.preferredCommander().ObjectName
			}
		})
		model.send_message('update_commander', {
            commander: { ObjectName: model.preferredCommander().ObjectName }
        });
	}
	
	model.startRankedGame = function() {
		if (model.allowNewOrJoinGame()) {
			showLoad();
			doStart();
			setText("starting search...");
		} else {
			console.log("missing a login for a ranked game!");
		}
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
	
	var doStart = function() {
		startedLoading = false;
		loaded = false;
		serverLoaded = false;
		cancelLoops = false;
		engine.call('reset_game_state');
		doPolls();
	};
	
	var doPolls = function() {
		window.setTimeout(function() {
			searching = true;
			pollHasGame();
		}, pollingSpeed);
	};
	
	var reset = function() {
		if (!startedLoading) {
			cancelLoops = true;
			localStorage[paStatsGlobal.isRankedGameKey] = encode(false);
			unregister();
			showCancelBtt();
			setText("gonna restart searching in a moment");
			window.setTimeout(function() {
				doStart();
			}, pollingSpeed * 2);
		}
	}
	
	var cancel = function() {
		startedLoading = false;
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
		$('#youtubewarning').remove();
		reset();
	};
	
	handlers.connection_disconnected = function(payload) {
		setText("connection disconnected");
		$('#youtubewarning').remove();
		reset();
	};
	
	handlers.login_rejected = function(payload) {
		setText("login rejected");
		$('#youtubewarning').remove();
		reset();
	};
	
	var loadPlanet = ko.observable({}).extend({ local: 'pa_stats_loaded_planet' });

	var setPaStatsTeams = function() {
		// these are not actually used anymore for now in live_game
//		localStorage[paStatsGlobal.pa_stats_session_team_index] = encode(iAmHost ? 0 : 1);
//		
//		var p0 = latestArmies[0].primary_color;
//		var s0 = latestArmies[0].secondary_color;
//		
//		var p1 = latestArmies[1].primary_color;
//		var s1 = latestArmies[1].secondary_color;
//		
//		var teams = [
//		  {
//			  index: 0,
//			  primaryColor: "rgb("+p0[0]+","+p0[1]+","+p0[2]+")",
//			  secondaryColor: "rgb("+s0[0]+","+s0[1]+","+s0[2]+")",
//			  players: [{displayName: latestArmies[0].name}],
//		  },
//		  {
//			  index: 1,
//			  primaryColor: "rgb("+p1[0]+","+p1[1]+","+p1[2]+")",
//			  secondaryColor: "rgb("+s1[0]+","+s1[1]+","+s1[2]+")",
//			  players: [{displayName: latestArmies[1].name}],
//		  }
//		];
//		
//		localStorage[paStatsGlobal.pa_stats_session_teams] = encode(teams);
	};
	
	var latestArmies = undefined;
	
	var waitForLoadLoop = function(callback) {
		var loadFinished = loaded && serverLoaded;
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
			$('#youtubewarning').remove();
			reset();
		});
	}

	var startedLoading = false;
	
    var testLoading = function() {
        var worldView = api.getWorldView(0);
        if (worldView) {
            worldView.arePlanetsReady().then(function(ready) { 
                loaded = ready;
                model.send_message('set_loading', {loading: !ready});
                setTimeout(testLoading, 500);
            });
        } else {
        	setTimeout(testLoading, 500);
        } 
    };
	
	handlers.control = function(payload) {
		if (!payload.has_first_config && iAmHost) {
			writeDescription();
		}
		
		serverLoaded = payload.sim_ready;
		
		//if (payload.starting) {
		//	setText("The game is now loading...");
		//	startedLoading = true;
		//}
	};
	
	handlers.server_state = function(msg) {
		if (msg.data) {
			latestArmies = msg.data.armies;
		}
		
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

	    // this is not handled by this code anymore
	    // however this code path would still work
	    // the loading screen has some timeout-related advantages though
	    // so I enter the loading screen and this will never happen here
		if (msg.state === "landing") { // this happens when the game moves into the live_game.js
			localStorage[paStatsGlobal.isRankedGameKey] = encode(true);
			setPaStatsTeams();
			// we are done after this
			window.location.href = msg.url;
		} else if (msg.state === "lobby") { // happens when connect to game is complete
			if (msg.data && !iAmHost) {
				loadPlanet(createSimplePlanet(adaptServerGameConfig(msg.data).system));
			}
				
			if (iAmHost) {
				setText("configure planets...");
				writeDescription();
			}
			
			setTimeout(testLoading, pollingSpeed);
			
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
				toggleReady();
				runHostWaitLoop();
			}
		}
	};
	
	
	
	paStatsGlobal.checkIfPlayersAvailable("#pa_stats_players_note");
})();

