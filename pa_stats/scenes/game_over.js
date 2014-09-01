(function() {
	paStatsGlobal.unlockGame(); // usually the game should be unlocked here already, this call is just here to make sure it really is unlocked
	checkPaStatsVersion();

	if (decode(localStorage[paStatsGlobal.wantsToSendKey]) || decode(localStorage[paStatsGlobal.isRankedGameKey])) {
		
		function wasVsAiGame(msg) {
			var armies = msg.data.armies;
			var humanArmyCnt = 0;
			for (var i = 0; i < armies.length; i++) {
				if (!armies[i].ai) {
					humanArmyCnt++;
				}
			}
			return humanArmyCnt <= 1;
		}
		
		function getWinnerTeamIndex(msg) {
			var armies = msg.data.armies;
			var armiesAlive = 0;
			console.log(armies);
			for (var i = 0; i < armies.length; i++) {
				if (!armies[i].defeated) {
					armiesAlive++;
				}
			}
			var winnerIndex = -2;
			if (armiesAlive > 1 || wasVsAiGame(msg)) {
				winnerIndex = -2;
			} else if (armiesAlive == 0) {
				winnerIndex = -1; // all dead => draw
			} else {
				for (var i = 0; i < armies.length; i++) {
					if (!armies[i].defeated) {
						return i;
					}
				}
				winnerIndex = -2; // this should never really happen...
			}
			return winnerIndex;
		}
		
		var oldGameOverHandler = handlers.server_state;
		handlers.server_state = function(payload) {
			if (payload && payload.data) {
				var winnerTeam = getWinnerTeamIndex(payload)
				
				var gameOverMsg = payload.data.game_over;
	            var gameOverText = "";
	            if (winnerTeam != -1 && gameOverMsg && gameOverMsg.victor_name) {
	                var numWinners = gameOverMsg.victor_players.length;
	                if (numWinners) {
	                    gameOverText += gameOverMsg.victor_players.join(", ");
	                } else { //ai victory
	                    gameOverText += gameOverMsg.victor_name;
	                }
	            } else {
	            	// causes the original handler to show "DRAW"
	            	delete payload.data.game_over.victor_name
	                gameOverText = "DRAW";
	            }
	            
				$.ajax({
					type : "PUT",
					url : paStatsGlobal.queryUrlBase + "report/winner",
					contentType : "application/json",
					data : JSON.stringify({
						gameLink : decode(localStorage['pa_stats_game_link']),
						victor : gameOverText,
						teamIndex: winnerTeam 
					}),
					complete : function(r) {
						oldGameOverHandler(payload);
					}
				});
			} else {
				oldGameOverHandler(payload);
			}
		};
		
		// HACKZZZZ TO GIVE A USABLE GAMEOVER PAGE!!
		// Seriously: here it gets ugly...
		
		$('.tr_datarow:eq(2)').remove(); //remove all the garbage html
		$('.tr_datarow:eq(2)').remove();
		$('.tr_datarow:eq(2)').remove();
		$('.tr_datarow:eq(2)').remove();
		$('.tr_datarow:eq(2)').remove();
		$('.div_non_perf_stats').remove();

		model.showDataTable = ko.observable(true);
		model.showGraphBool = ko.observable(false);
		model.timeValue = ko.observable("");

		// queryUrlBase is determined in global.js
		var chartURL = paStatsGlobal.queryUrlBase+"ingamechart?gameIdent=" + decode(localStorage['lobbyId']);
		var jsonURL = paStatsGlobal.queryUrlBase+"report/get?gameIdent=" + decode(localStorage['lobbyId']);


		var button_str = '<a data-bind="click_sound: \'default\', rollover_sound: \'default\'"><input type="button" value="SHOW GAME GRAPHS" id="" class="btn_commit" data-bind="click: showGraph"/></a>';
		// this is broken and a noop since ages, so let's not show it
//		$(".div_commit_buttons_cont").append(button_str); // button for toggling between graph and table

		model.showGraph = function ()
		{
			model.browserTitle("PA Stats");
			model.browserHome(chartURL);
			model.navBrowserHome();
			model.openBrowser();
		};

		var time_str = '<div class=\"div_non_perf_stats\" >DURATION: <span id=\"time\" data-bind=\"text: timeValue\">00:00:00</span></div>';
		$(".div_data_graph").after(time_str);


		function addNewGroup(name, columnNames)
		{
		   var group_str = "<td class=\"td_group\" colspan=\"" + columnNames.length + "\">" + name + "</td>";
		   $(".tr_datarow:eq(0)").append(group_str);
		   
		   for(var i = 0; i < columnNames.length; ++i)
		   {
		      var column_str = "<td class=\"td_category\">" + columnNames[i] + "</td>"
		      $(".tr_datarow:eq(1)").append(column_str);
		   }
		}

		addNewGroup("APM", ["AVERAGE", "HIGHEST", "LOWEST"]);

		var sizeOfPlayerRowData = 15;

		var playersName = []; //temporary data
		var playersData = []; //temporary data
		var playersList = []; //final data that will be used
		var totalTimeOfGame = [];

		function addPlayerScoreRow(playerData)
		{
		   var row_str = '<tr class="tr_datarow">';
		   
		   row_str += '<td class="td_name">';
		   row_str += playerData[0];
		   row_str += '</td>';
		   
		   for( var i = 1; i < playerData.length; ++i )
		   {
		      row_str += '<td class="td_item">';
		      row_str += playerData[i];
		      row_str += '</td>';
		   }
		   row_str += '</tr>';
		   $(".tbl_scoreboard").append(row_str);
		}

		function loadData(url)
		{
		   function dataHandler(data)
		   {
		      var index = 0;
		      $.each(data.playerTimeData, function(key, val) {
		         playersName.push(data.playerInfo[key].name);
		         playersData.push(val);
		      });
		      
		      // copied from chartpage.js
		      function getApmFor(tp, i) {
					if (tp.length < 2) {
						return 0;
					}
		    	  
					var averageSeconds = 60*1000;
					var maxPoints = 100;
					
					var timeFound = 0;
					var startPoint = i;
					var sum = 0;
					for (var j = 1; j < maxPoints; j++) {
						if (i - j >= 0 && timeFound < averageSeconds) {
							sum = sum + tp[i-j]['apm'];
							timeFound += tp[i-j+1].timepoint - tp[i-j].timepoint;
						} else {
							break;
						}
					}
					// use recursion to fix the first point of the table by displaying the same value as the 2nd point has
					return timeFound == 0 ? getApmFor(tp, i+1) : sum / (timeFound / 60000);
		      }	
				
		      for(var i = 0; i < playersName.length; ++i)
		      {
		         var player = [];
		         player[0] = playersName[i];
		         totalTimeOfGame[i] = 0;
		         for(var a = 1; a < sizeOfPlayerRowData; ++a)
		         {
		            player[a] = 0; //need to set the data
		         }
		         player[14] = 99999; //set lowest apm to high value so that we can easily get the actual lowest
		         
		         for(var j = 1; j < playersData[i].length; ++j)
		         {
		        	 var oldTimePoint = +playersData[i][j-1].timepoint;
		             var newTimePoint = +playersData[i][j].timepoint - oldTimePoint;
		             totalTimeOfGame[i] += newTimePoint;
		         }
		         
		         for(var j = 0; j < playersData[i].length; ++j)
		         {
		            player[4] += +playersData[i][j].metalProduced;
		            player[6] += +playersData[i][j].metalWasted;
		            player[7] += +playersData[i][j].energyProduced;
		            player[9] += +playersData[i][j].energyWasted;
		            var apmHere = getApmFor(playersData[i], j);
		            player[12] += apmHere;

		            if(player[13] < apmHere)//set highest apm
		        	{
		            	player[13] = Math.floor(apmHere);
		        	}
		            if(player[14] > apmHere)//set lowest apm
		        	{
		            	player[14] = Math.floor(apmHere);
		        	}
		         }
		         
		         player[5] = player[4] - player[6]; // metal consumed 
		         player[8] = player[7] - player[9]; // energy consumed

		         player[12] = Math.floor(player[12] / playersData[i].length);
		         
		         playersList.push(player); // add the final player to the final player list
		         addPlayerScoreRow(player);
		         
		      }
		      
		      
		      var actualTimeOfGame = 0;
		      for(var j = 0; j < totalTimeOfGame.length; ++j)
		      {
		    	  if(totalTimeOfGame[j] > actualTimeOfGame)
				  {
		    		  actualTimeOfGame = totalTimeOfGame[j];
				  }
		      }

				      
		      var fillZeroes = "00000000000000000000"; // max number of zero fill ever
														// asked for in global

				function zeroFill(number, width) {
					// make sure it's a string
					var input = number + "";
					var prefix = "";
					if (input.charAt(0) === '-') {
						prefix = '-';
						input = input.slice(1);
						--width;
					}
					var fillAmt = Math.max(width - input.length, 0);
					return prefix + fillZeroes.slice(0, fillAmt) + input;
				}

				var secs = actualTimeOfGame / 1000;
				
				var min = Math.floor(secs / 60);
				var sec = Math.floor(secs % 60);
				
		      
		      
		      model.timeValue(zeroFill(min, 2) + ":" + zeroFill(sec, 2)); // set the length of the game
		         
		   }

		   $.getJSON(url, dataHandler).fail(function(){
			   console.log("failed to load, retrying...");
			   setTimeout(window.location.reload, 5000);
		   });
		   
		}

		
		loadData(jsonURL);
	}
}());


