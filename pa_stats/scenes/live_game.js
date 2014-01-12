$(".div_message_display_cont")
		.prepend(
				'<div id="pastatsadds"><div>Send data to PA Stats: <input type="checkbox" data-bind="checked: wantsToSend"/></div>'+
				'<div data-bind="visible: wantsToSend">Show live updates on the webpage: <input type="checkbox" data-bind="checked: showDataLive"/></div></div>');

model.delayTime = ko.observable(0).extend({local: 'pa_stats_delay_time'});


model.showDataLive = ko.observable(true).extend({local: showDataLiveKey})
model.wantsToSend = ko.observable(true).extend({local : wantsToSendKey});

function ValueChangeAccumulator(observable) {
	var self = this;
	self.tickValueAccumulation = 0;
	self.lastKnownValue = 0;
	self.lastChangeTime = new Date().getTime();

	self.doUpdate = function(newOldValue) {
		var timeOfChange = new Date().getTime();
		self.tickValueAccumulation += Math.round(self.lastKnownValue / 1000
				* (timeOfChange - self.lastChangeTime));
		self.lastKnownValue = newOldValue;
		self.lastChangeTime = timeOfChange;
	};

	self.reset = function() {
		self.tickValueAccumulation = 0;
	}

	self.get = function() {
		self.doUpdate(observable());
		var v = self.tickValueAccumulation;
		self.tickValueAccumulation = 0;
		return v;
	}

	observable.subscribe(function(newValue) {
		self.doUpdate(newValue);
	});
}

var wastingMetalObs = ko.computed(function() {
	if (model.currentMetal() == model.maxMetal() && model.metalNet() > 0) {
		return model.metalNet();
	} else {
		return 0;
	}
});

var wastingEnergyObs = ko.computed(function() {
	if (model.currentEnergy() == model.maxEnergy() && model.energyNet() > 0) {
		return model.energyNet();
	} else {
		return 0;
	}
});

var metalProductionAccu = new ValueChangeAccumulator(model.metalGain);
var energyProductionAccu = new ValueChangeAccumulator(model.energyGain);
var metalWastingAccu = new ValueChangeAccumulator(wastingMetalObs);
var energyWastingAccu = new ValueChangeAccumulator(wastingEnergyObs);

var gameIdent = decode(localStorage['lobbyId']) + "";

var displayName = decode(sessionStorage['displayName']);
var uberName = decode(localStorage['uberName']);

var loadedPlanet = ko.observable({}).extend({
	local : 'pa_stats_loaded_planet'
})();

var apmCnt = 0;

// http://stackoverflow.com/questions/2360655/jquery-event-handlers-always-execute-in-order-they-were-bound-any-way-around-t
// [name] is the name of the event "click", "mouseover", ..
// same as you'd pass it to bind()
// [fn] is the handler function
$.fn.bindFirst = function(name, fn) {
	// bind as you normally would
	// don't want to miss out on any jQuery magic
	this.on(name, fn);

	// Thanks to a comment by @Martin, adding support for
	// namespaced events too.
	this.each(function() {
		var handlers = $._data(this, 'events')[name.split('.')[0]];
		// take out the handler we just inserted from the end
		var handler = handlers.pop();
		// move it at the beginning
		handlers.splice(0, 0, handler);
	});
};

var actionsSinceLastTick = 0;

$(document).ready(function() {
	$(document).bindFirst("keyup", function(e) {
		actionsSinceLastTick++;
	});
	$(document).bindFirst("mousedown", function(e) {// click onto ui elements
		actionsSinceLastTick++;
	});
	$('.holodeck').bindFirst("mousedown", function(e) { // click into 3d world
		actionsSinceLastTick++;
	});
});

function getApm() {
	var apm = actionsSinceLastTick;
	actionsSinceLastTick = 0;
	return apm;
}

var startedSendingStats = false;
var gameLinkId = undefined;

function maySetupReportInterval() {
	if (!startedSendingStats && !gameIsOverOrPlayerIsDead
			&& reportVersion >= localStorage['pa_stats_req_version']) {
		startedSendingStats = true;
		actionsSinceLastTick = 0;
		setInterval(model.sendStats, 5000);
	}
}

var gameIsOverOrPlayerIsDead = false;

var playStartTime = undefined;

function updatePlayStartTime() {
	var serverNow = getServerTimeForNow();
	if (serverNow != undefined) {
		playStartTime = serverNow;
	} else {
		var now = new Date().getTime();
		callServerTime(function(t) {
			var nowAfterCall = new Date().getTime();
			var diff = nowAfterCall - now;
			playStartTime = t-diff;
		});
	}
}

var oldServerState = handlers.server_state;
handlers.server_state = function(m) {
	oldServerState(m);
	if (m.state !== 'game_over' && m.url && m.url !== window.location.href) {
		unlockGame_();
	}
	switch(m.state) {
		case 'landing':
			pasHadReconnect = false;
			break;
		case 'game_over':
			gameIsOverOrPlayerIsDead = true;
			unlockGame_();
			break;
		case 'playing':
			updatePlayStartTime();
			maySetupReportInterval();
			break;
	}
}

var oldNavToMainMenupas = model.navToMainMenu;
model.navToMainMenu = function() {
	unlockGame(oldNavToMainMenupas);
}

var oldExitpas = model.exit;
model.exit = function() {
	unlockGame(oldExitpas);
}

model.hasFirstResourceUpdate.subscribe(function(v) {
	if (v) {
		maySetupReportInterval();
	}
});

var deathReported = false;
var addedDeathListener = false;
function addDeathListener() {
	addedDeathListener = true;
	model.armySize.subscribe(function(v) {
		if (v == 0 && !deathReported) { // army count = 0 > the player died!
			$.ajax({
				type : "PUT",
				url : queryUrlBase + "report/idied",
				contentType : "application/json",
				data : JSON.stringify({
					gameLink : gameLinkId
				}),
			});
			deathReported = true;
		}
	});
}

var updateTimeCnt = 0;
var mostRecentServerTime = undefined;
var mostRecentServerTimeInLocalTime = undefined;

function getServerTimeForNow() {
	if (mostRecentServerTimeInLocalTime == undefined) {
		return undefined;
	} else {
		var now = new Date().getTime();
		var diff = now - mostRecentServerTimeInLocalTime;
		return mostRecentServerTime + diff;
	}
}

function callServerTime(handler) {
	$.get(queryUrlBase + "report/get/time", function(timeMs) {
		handler(timeMs);
	});
}

model.updateServerAndLocalTime = function () {
	callServerTime(function(timeMs) {
		mostRecentServerTime = timeMs.ms;
		mostRecentServerTimeInLocalTime = new Date().getTime();
	});
}

model.updateServerAndLocalTime();



//// hijack some method that is in the right place to execute our engine calls
//var paStatsOldApplyUiStuff = model.applyUIDisplaySettings;
//model.applyUIDisplaySettings = function() {
//	function listenToAllAlerts() {
//		engine.call('watchlist.setCreationAlertTypes', JSON.stringify(['Mobile', 'Structure']));
//		engine.call('watchlist.setDeathAlertTypes', JSON.stringify(['Mobile', 'Structure']));
//		// damage alerts trigger whenever health changes, even when it goes up.
//		// so this is kind of useless, thus no support for them is implemented
////		engine.call('watchlist.setDamageAlertTypes', JSON.stringify(['Mobile', 'Structure']));
//	}
//	
//	listenToAllAlerts();
//	
//	// to get rid of wrong settings by rAlertsFilter
//	window.setTimeout(listenToAllAlerts, 3000);
//	// this basically is a race condition vs rAlertsFilter, so better save than sorry
//	window.setTimeout(listenToAllAlerts, 5000); 
//	
//	paStatsOldApplyUiStuff();
//};

var pasCapturedEvents = [];

var pasHadReconnect = true;
var pasKnownIdLimit = undefined;
var pasSeenConstructionEvents = {};

alertsManager.addListener(function(payload) {
	if (mostRecentServerTime !== undefined) { // in this case we just can wait until we have the first time. Should only matter for reconnects
		for (var i = 0; i < payload.list.length; i++) {
			var notice = payload.list[i];
			
			if (pasKnownIdLimit === undefined) {
				// this check is based on the assumption that the unit ID will always go up. I wonder if that is correct
				pasKnownIdLimit = notice.id; // below this id no checks for false "destroyed" events will be done to prevent huge problems in case of reconnects at the price of not perfect data (possibility for false destroy-events in case of destroyed half finished buildings from before the reconnect) in those case.
			}
			
			if (notice.watch_type == 0 || notice.watch_type == 2) {
				if (notice.watch_type == 0) {
					pasSeenConstructionEvents[notice.id] = true;
				}
				
				if (notice.watch_type != 2 || (pasHadReconnect && pasKnownIdLimit >= notice.id) || pasSeenConstructionEvents[notice.id]) {
					if (notice.watch_type == 2) {
						delete pasSeenConstructionEvents[notice.id]; // prevent the set from growing forever
					}
					pasCapturedEvents.push(makeArmyEvent(
							notice.spec_id,
							notice.location.x,
							notice.location.y,
							notice.location.z,
							notice.planet_id,
							notice.watch_type,
							getServerTimeForNow())
					);
				} // else we got an "destroyed" event for a building that wasn't finished in the first place.
			}
		}
	}
});

model.sendStats = function() {
	if (!model.hasFirstResourceUpdate() // game has not yet started
			|| gameIsOverOrPlayerIsDead // review
			|| (model.armySize() == 0) // observer
			|| reportVersion < localStorage['pa_stats_req_version'] // bad version
			|| model.showTimeControls() // chonocam
			|| !model.wantsToSend()// user refused at the start of the game
			|| playStartTime === undefined) { // quering the starttime from the server has not yet been successful
		actionsSinceLastTick = 0;
		return;
	}

	updateTimeCnt++;
	if (updateTimeCnt % 12 == 0) {
		model.updateServerAndLocalTime();
	}
	
	if (!addedDeathListener) {
		addDeathListener();
	}

	var statsPacket = new StatsReportData();
	statsPacket.armyCount = model.armySize();
	statsPacket.metalIncomeNet = model.metalNet();
	statsPacket.energyIncomeNet = model.energyNet();
	statsPacket.metalStored = model.currentMetal();
	statsPacket.energyStored = model.currentEnergy();
	statsPacket.metalProducedSinceLastTick = metalProductionAccu.get();
	statsPacket.energyProducedSinceLastTick = energyProductionAccu.get();
	statsPacket.metalWastedSinceLastTick = metalWastingAccu.get();
	statsPacket.energyWastedSinceLastTick = energyWastingAccu.get();
	statsPacket.metalSpending = model.metalLoss();
	statsPacket.energySpending = model.energyLoss();
	statsPacket.metalIncome = model.metalGain();
	statsPacket.energyIncome = model.energyGain();
	statsPacket.apm = getApm();

	var report = undefined;

	if (gameLinkId === undefined) {
		report = new ReportData();
		
		report.ident = gameIdent;
		report.reporterUberName = uberName;
		report.reporterDisplayName = displayName;
		report.reporterTeam = decode(localStorage[pa_stats_session_team_index]);
		report.observedTeams = decode(localStorage[pa_stats_session_teams]);
		report.showLive = model.showDataLive();
		report.firstStats = statsPacket;
		report.paVersion = model.buildVersion();
		
		report.planet.seed = loadedPlanet.seed;
		report.planet.temperature = loadedPlanet.temperature + "";
		report.planet.water_height = loadedPlanet.waterHeight + "";
		report.planet.height_range = loadedPlanet.heightRange + "";
		report.planet.radius = loadedPlanet.radius + "";
		report.planet.biome = loadedPlanet.biome;
		report.planet.planet_name = loadedPlanet.name;
		
		report.armyEvents = pasCapturedEvents;
		
		report.gameStartTime = playStartTime;
		
		report.fixUpBrokenTeamIndex();
	} else {
		report = new RunningGameData();
		report.gameLink = gameLinkId;
		report.stats = statsPacket;
		
		report.armyEvents = pasCapturedEvents;
	}
	pasCapturedEvents = [];
	
	// queryUrlBase is determined in global.js
	$.ajax({
		type : "PUT",
		url : queryUrlBase + "report",
		contentType : "application/json",
		data : JSON.stringify(report),
		success : function(result) {
			if (gameLinkId === undefined) {
				gameLinkId = result.gameLink;
				localStorage['pa_stats_game_link'] = encode(gameLinkId);
				$("#pastatsadds").remove();
			}
		}
	});
}