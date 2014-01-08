//check if we are currently in development mode and determine correct URL to use
var queryUrlBase = undefined;

if (typeof statsDevelopment != 'undefined') {
	queryUrlBase = "http://127.0.0.1:8080/";
} else {
	queryUrlBase = "http://www.nanodesu.info/pastats/";
}

var reportVersion = 14;

function checkPaStatsVersion() {
	$.get(queryUrlBase + "report/version", function(v) {
		localStorage['pa_stats_req_version'] = v.version;
	});
}

function unlockGame(finalCall) {
	var link = sessionStorage['pa_stats_game_link'];
	if (link !== undefined) {
		$.ajax({
			type : "GET",
			url : queryUrlBase + "report/unlock?link=" + decode(link),
			complete : function(r) {
				finalCall();
			}
		});
	} else {
		finalCall();
	}
}

function unlockGame_() {
	unlockGame(function() {
	});
}

// parses all units, following unit bases recursively
// onComplete is given the finished map of spec => custom piece of data per spec
// dataGetter gets the data from the unit json, it expects one parameter: the parsed unit json
// datamerger expected two parameters, the data further up the definition tree of the unit and further down
// examples see the next 2 functions after this
function loadUnitData(onComplete, dataGetter, dataMerger) {
	var resultTypeMapping = {};
	var spawnedUnitCalls = 0;
	$.getJSON("coui://pa/units/unit_list.json", function(data) {
		var units = data.units;
		var finishedAll = false;
		
		function readUnitDataFromFile(file, callback) {
			$.getJSON(file, function(unit) {
				var freshDataFromUnit = dataGetter(unit);
				var baseSpec = unit.base_spec;
				
				if (baseSpec != undefined) {
					readUnitDataFromFile("coui://"+baseSpec, function(unitData) {
						callback(dataMerger(freshDataFromUnit, unitData));
					});
				} else {
					if (freshDataFromUnit != undefined) {
						callback(freshDataFromUnit);
					}
					spawnedUnitCalls--;
					if (spawnedUnitCalls == 0) {
						onComplete(resultTypeMapping);
					}
				}
			});
		}
		
		spawnedUnitCalls = units.length;
		for (var i = 0; i < units.length; i++) {
			function processUnitPath(unitPath) {
				readUnitDataFromFile("coui://"+unitPath, function(unitData) {
					resultTypeMapping[unitPath] = unitData;
				});
			}
			processUnitPath(units[i]);
		}
	});
}

function loadUnitTypesArray(onComplete) {
	loadUnitTypeMapping(function(mapping) {
		var types = [];
		for (unit in mapping) {
			types = types.concat(mapping[unit]);
		}
		types = types.filter(function(elem, pos) {
			return types.indexOf(elem) == pos;
		});
		onComplete(types);
	});
}

//creates a map of all unit specs to their display name
function loadUnitNamesMapping(onComplete) {
	loadUnitData(onComplete, function(unit) {
		return unit.display_name;
	}, function (dataUpTheTree, dataDownTheTree) {
		return dataUpTheTree; // first name encountered is used
	});
}

//creates a map of all unit spec to an array of their type
function loadUnitTypeMapping(onComplete) {
	loadUnitData(onComplete, function(unit) {
		var unitTypes = unit.unit_types;
		if (unitTypes != undefined) {
			for (var u = 0; u < unitTypes.length; u++) {
				unitTypes[u] = unitTypes[u].replace("UNITTYPE_", "");
			}
		}
		return unitTypes;
	}, function(dataUpTheTree, dataDownTheTree) {
		if (dataUpTheTree == undefined) {
			dataUpTheTree = [];
		}
		if (dataDownTheTree == undefined) {
			dataDownTheTree = [];
		}
		return dataUpTheTree.concat(dataDownTheTree);
	});
}

var nanodesu = "info.nanodesu.pastats.";
var pa_stats_session_teams = nanodesu + "teams";
var pa_stats_session_team_index = nanodesu + "team_index";
var pa_stats_stored_version = nanodesu + "version";
var wantsToSendKey = 'pa_stats_wants_to_send_';
var showDataLiveKey = "pa_stats_show_data_live";
var showCreatedAlerts = nanodesu + "showCreatedAlerts";
var showDestroyedAlerts = nanodesu + "showDestroyedAlerts";
var includedUnitSpecAlertsCreated = nanodesu + "includedUnitSpecAlerts.create";
var excludedUnitSpecAlertsCreated = nanodesu + "excludedUnitSpecAlerts.create";
var includedUnitSpecAlertsDestroyed = nanodesu + "includedUnitSpecAlerts.destroy";
var excludedUnitSpecAlertsDestroyed = nanodesu + "excludedUnitSpecAlerts.destroy";

// make sure the defaults are set
if (localStorage[wantsToSendKey] === undefined) {
	localStorage[wantsToSendKey] = encode(true);
	localStorage[showDataLiveKey] = encode(true);	
}
// in an extra block of code, since this was added later on
if (localStorage[showCreatedAlerts] === undefined) {
	localStorage[showCreatedAlerts] = encode(["Factory"]);
	localStorage[showDestroyedAlerts] = encode(["Structure"]);
	localStorage[includedUnitSpecAlertsDestroyed] = encode([]);
	localStorage[excludedUnitSpecAlertsDestroyed] = encode([]);
	localStorage[includedUnitSpecAlertsCreated] = encode([]);
	localStorage[excludedUnitSpecAlertsCreated] = encode([]);
}