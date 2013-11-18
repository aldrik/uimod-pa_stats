$(".div_message_display_cont")
		.prepend(
				'<div>Send data to PA Stats: <input type="checkbox" data-bind="checked: wantsToSend"/></div>'+
				'<div data-bind="visible: wantsToSend">Show live updates on the webpage: <input type="checkbox" data-bind="checked: showDataLive"/></div>');

model.delayTime = ko.observable(0).extend({local: 'pa_stats_delay_time'});

var showDataLiveKey = "pa_stats_show_data_live";
model.showDataLive = ko.observable(true).extend({local: showDataLiveKey})

var wantsToSendKey = 'pa_stats_wants_to_send_'; 
model.wantsToSend = ko.observable(true).extend({local : wantsToSendKey});

if (localStorage[wantsToSendKey] === undefined) {
	model.wantsToSend(true);
	model.wantsToSend(false);
	model.wantsToSend(true);
}

function StatsReportData() {
	var self = this;
	self.armyCount = 0;
	self.metalIncome = 0;
	self.energyIncome = 0;
	self.metalStored = 0;
	self.energyStored = 0;
	self.metalProducedSinceLastTick = 0;
	self.energyProducedSinceLastTick = 0;
	self.metalWastedSinceLastTick = 0;
	self.energyWastedSinceLastTick = 0;
	self.metalIncomeNet = 0;
	self.energyIncomeNet = 0;
	self.metalSpending = 0;
	self.energySpending = 0;
	self.apm = 0;
}

function ReportData() {
	var self = this;
	self.ident = "";
	self.reporter_uber_name = "";
	self.reporter_display_name = "";
	self.observedPlayers = [];
	self.showLive = true;
	self.firstStats = new StatsReportData();
	self.version = reportVersion;
	self.planet = new ReportedPlanet();
	self.pa_version = model.buildVersion();
}

function ReportedPlanet() {
	var self = this;
	self.seed = 0;
	self.temperature = 0;
	self.water_height = 0;
	self.radius = 0;
	self.biome = "metal";
	self.planet_name = "unknown planet";
	self.height_range = 0;
}

function RunningGameData() {
	var self = this;
	self.gameLink = 0;
	self.game = 0;
	self.stats = new StatsReportData();
}

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
var game = undefined;

function maySetupReportInterval() {
	if (!startedSendingStats && !gameIsOverOrPlayerIsDead
			&& reportVersion >= localStorage['pa_stats_req_version']) {
		startedSendingStats = true;
		actionsSinceLastTick = 0;
		setInterval(model.sendStats, 5000);
	}
}

var gameIsOverOrPlayerIsDead = false;

var oldServerState = handlers.server_state;
handlers.server_state = function(m) {
	oldServerState(m);
	if (m.state !== 'game_over' && m.url && m.url !== window.location.href) {
		unlockGame_();
	}
	switch(m.state) {
		case 'game_over':
			gameIsOverOrPlayerIsDead = true;
			unlockGame_();
			break;
		case 'playing':
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

var allPlayers = [];
var oldArmiesState = handlers.army_state;
handlers.army_state = function(armyLst) {
	allPlayers = [];
	for ( var i = 0; i < armyLst.length; i++) {
		allPlayers.push(armyLst[i].name);
	}
	oldArmiesState(armyLst);
}

model.sendStats = function() {
	
	if (!model.hasFirstResourceUpdate() // game has not yet started
			|| gameIsOverOrPlayerIsDead // review
			|| model.armySize() == 0 // observer
			|| reportVersion < localStorage['pa_stats_req_version'] // bad version
			|| model.showTimeControls() // chonocam
			|| !model.wantsToSend()) { // user refused
		actionsSinceLastTick = 0;
		return;
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
		var report = new ReportData();

		report.ident = gameIdent;
		report.reporter_uber_name = uberName;
		report.reporter_display_name = displayName;
		report.observedPlayers = allPlayers;
		report.showLive = model.showDataLive();
		report.firstStats = statsPacket;
		
		report.planet.seed = loadedPlanet.seed;
		report.planet.temperature = loadedPlanet.temperature + "";
		report.planet.water_height = loadedPlanet.waterHeight + "";
		report.planet.height_range = loadedPlanet.heightRange + "";
		report.planet.radius = loadedPlanet.radius + "";
		report.planet.biome = loadedPlanet.biome;
		report.planet.planet_name = loadedPlanet.name;
	} else {
		report = new RunningGameData();
		report.gameLink = gameLinkId;
		report.game = game;
		report.stats = statsPacket;
	}
	
	// queryUrlBase is determined in global.js
	$.ajax({
		type : "PUT",
		url : queryUrlBase + "report",
		contentType : "application/json",
		data : JSON.stringify(report),
		success : function(result) {
			if (gameLinkId === undefined) {
				gameLinkId = result.gameLink;
				game = result.game;
				sessionStorage['pa_stats_game_id'] = encode(game);
				sessionStorage['pa_stats_game_link'] = encode(gameLinkId);
			}
		}
	});
}