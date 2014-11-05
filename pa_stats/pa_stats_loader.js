// base URL for webservices
var paStatsHost = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? "http://127.0.0.1:8080/" : "http://ns393951.ip-176-31-115.eu/";
// location of mod files
var paStatsBaseDir = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? 'coui://pa_stats/' : 'http://ns393951.ip-176-31-115.eu/mod/live/';

(function() {
	
	function addSceneEntry(scene, entry) {
		if(!scene_mod_list[scene]) {
			scene_mod_list[scene] = [];
		}
		scene_mod_list[scene].push(entry);
	}
	
	if (typeof paStatsGlobal === 'undefined') {
		var b = paStatsBaseDir+ "/";
		
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
		
		addSceneEntry('connect_to_game', b+'lib/captureLobbyId.js');
		addSceneEntry('connect_to_game', b+'scenes/connect.js');
		addSceneEntry('server_browser', b+"scenes/server_browser.js");
		
		addSceneEntry('new_game_ladder', b+"scenes/new_game_ladder.js");
		addSceneEntry('new_game', b+"scenes/new_game.js");
		addSceneEntry('game_over', b+'scenes/game_over.js');
		
		addSceneEntry('matchmaking', b+'scenes/matchmaking.js');
		
		addSceneEntry('live_game', b+'scenes/autopause.js');
		addSceneEntry('live_game', b+'lib/alertsManager.js');
		addSceneEntry('live_game', b+'scenes/live_game.js');
		
		addSceneEntry('lobby', b+'scenes/lobby.js');
		addSceneEntry('settings', b+'scenes/settings.js');
		
		addSceneEntry('live_game_time_bar', b+"lib/alertsManager.js");
		addSceneEntry("live_game_unit_alert", b+'lib/alertsManager.js');
		addSceneEntry("live_game_message", b+"scenes/live_game_message.js");
		addSceneEntry('gw_start', b+'scenes/gw_start.js');
		
		addSceneEntry('start', b+'scenes/start.js');		
		
		addSceneEntry('uberbar', b+'scenes/uberbar.js');
		
		addSceneEntry('uberbar', b+"scenes/irc/irc.css");
		addSceneEntry('uberbar', b+"scenes/irc/irc.js");
	}
}());
