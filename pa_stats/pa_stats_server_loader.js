// base URL for webservices
var paStatsHost = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? "http://127.0.0.1:8080/" : "http://pastats.com/";
// location of mod files
var paStatsBaseDir = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? 'coui://pa_stats/' : 'http://pastats.com/mod/live/';

(function() {
	function addSceneEntry(scene, entry) {
		if(!scene_mod_list[scene]) {
			scene_mod_list[scene] = [];
		}
		if (scene_mod_list[scene].indexOf(entry) === -1) {
			scene_mod_list[scene].push(entry);
		}
	}
	var b = paStatsBaseDir;
	
	if (typeof paStatsGlobal === 'undefined') {
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
	}
	
	addSceneEntry('new_game', b+"scenes/new_game.js");
	addSceneEntry('new_game', b+"scenes/new_game_server.js");
	addSceneEntry('game_over', b+'scenes/game_over.js');
	
	addSceneEntry('live_game', b+'lib/alertsManager.js');
	addSceneEntry('live_game', b+'scenes/live_game.js');

	addSceneEntry('live_game_time_bar', b+"lib/alertsManager.js");
	addSceneEntry("live_game_unit_alert", b+'lib/alertsManager.js');
	addSceneEntry("live_game_message", b+"scenes/live_game_message.js");
}());