//check if we are currently in development mode and determine correct URL to use
var queryUrlBase = undefined;

if (typeof statsDevelopment != 'undefined') {
	queryUrlBase = "http://127.0.0.1:8080/";
} else {
	queryUrlBase = "http://www.nanodesu.info/pastats/";
}

var reportVersion = 13;

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

function showInfoMessage() {
	var lastVersion = localStorage[pa_stats_stored_version];

	var htmlMsg = '<div id="pa_stats_welcome" title="" style="visibility:hidden">' + 
    '<div style="font-size: 2em; font-weight: bold;">' +
        'Welcome to PA Stats' +
    '</div>' +
	'<div>Your PA Stats Version was automatically updated to the latest version.</div>' +
	'<div>Visit www.nanodesu.info/pastats/updates for the most recent Changelog.</div>' +
    '<div style="margin: 10px 0px;">' +
        'By clicking <b>Accept</b> below, you acknowledge that you have read and agree to the '+
        'following conditions.'+
    '</div>'+
    '<div id="div_eula_cont" style="height: auto; width: 550px; border: 1px solid #333;'+
        'overflow: auto; padding: 10px;">'+
		'<p>By using PA Stats you agree that arbitrary data on your gameplay will be gathered, processed and published on www.nanodesu.info/pastats so you and anyone else can analyze it.</p>'+
		'<p>Data however will only be processed in the interest of gameplay-analysis. No profit will be made with any data gathered</p>'+
		'<p>If you disagree please either uncheck "Send Data to PA Stats" ingame, which prevents any data from being sent, or deinstall PA Stats.</p>'+
		'<p>If you want a specific game deleted from the page contact me (Cola_Colin) in the Uberent forums.</p>'+
		'<p>This message will be displayed once for every bigger update that is made to PA Stats</p>'+
    '</div>'+
'</div>'
	
	$("body").append(htmlMsg);

	if (lastVersion != reportVersion) {
		$('#pa_stats_welcome').attr("style", "visibility:visible");
		$('#pa_stats_welcome').dialog({
			dialogClass: "no-close",
			closeOnEscape : false,
			draggable : false,
			resizable : false,
			height : 600,
			width : 600,
			modal : true,
			buttons : {
				"ACCEPT" : function() {
					localStorage[pa_stats_stored_version] = reportVersion;
					$(this).dialog("close");
				}
			}
		});
	}
}

$(document).ready(function() {
	showInfoMessage();
});
