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