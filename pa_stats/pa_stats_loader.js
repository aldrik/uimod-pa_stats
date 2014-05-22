// base URL for webservices
var paStatsHost = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? "http://127.0.0.1:8080/" : "http://ns393951.ip-176-31-115.eu/";
// location of mod files
var paStatsBaseDir = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? 'coui://pa_stats/' : 'http://ns393951.ip-176-31-115.eu/mod/live/';

(function() {
	if (typeof paStatsGlobal === 'undefined') {
		var validatedPublicVersions = ["63475", "64498", "65588", "6650a3"];
		var version = decode(sessionStorage['build_version']);
		
		if (validatedPublicVersions.indexOf(version) === -1) {
			version = "unknown_version";
		}
		var noVersionbase = paStatsBaseDir;
		paStatsBaseDir = paStatsBaseDir + version + "/";
		
		var b = paStatsBaseDir;
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
		var c = b+'lib/captureLobbyId.js';
		scene_mod_list['server_browser'].push(b+"scenes/ranked_matcher/server_browser.js");
		scene_mod_list['connect_to_game'].push(c);
		scene_mod_list['server_browser'].push(b+"scenes/server_browser.js");
		scene_mod_list['new_game'].push(b+"scenes/new_game.js");
		scene_mod_list['game_over'].push(b+'scenes/game_over.js');
		scene_mod_list['live_game'].push(b+'lib/alertsManager.js');
		scene_mod_list['live_game'].push(b+'scenes/live_game.js');
		scene_mod_list['lobby'].push(b+'scenes/lobby.js');
		scene_mod_list['settings'].push(b+'scenes/settings.js');
	
		// the following scenes cannot find the version of PA correctly without huge troubles
		scene_mod_list['start'].push(noVersionbase+'scenes/start.js');		
		if (scene_mod_list['uberbar'] === undefined) {
			scene_mod_list['uberbar'] = [];
		}
		scene_mod_list['uberbar'].push(noVersionbase+'scenes/uberbar.js');
	}
}());

