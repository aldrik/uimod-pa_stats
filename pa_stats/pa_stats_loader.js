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
		var validatedPublicVersions = ["68331"];
		var version = decode(sessionStorage['build_version']);
		
		if (validatedPublicVersions.indexOf(version) === -1) {
			version = "unknown_version";
		} else {
			version = "stable";
		}
		console.log("load pa stats for version "+version);
		var noVersionbase = paStatsBaseDir;
		paStatsBaseDir = paStatsBaseDir + version + "/";
		
		var b = paStatsBaseDir;
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
		var c = b+'lib/captureLobbyId.js';
		addSceneEntry('server_browser', b+"scenes/ranked_matcher/server_browser.js");
		addSceneEntry('connect_to_game', c);
		addSceneEntry('server_browser', b+"scenes/server_browser.js");
		addSceneEntry('new_game', b+"scenes/new_game.js");
		addSceneEntry('game_over', b+'scenes/game_over.js');
		addSceneEntry('live_game', b+'lib/alertsManager.js');
		addSceneEntry('live_game', b+'scenes/live_game.js');
		addSceneEntry('lobby', b+'scenes/lobby.js');
		addSceneEntry('settings', b+'scenes/settings.js');
		
		addSceneEntry("live_game_unit_alert", b+'lib/alertsManager.js');
		addSceneEntry("live_game_message", b+"scenes/live_game_message.js");
		addSceneEntry('gw_start', b+'scenes/gw_start.js');
		
		// the following scenes cannot find the version of PA correctly without huge troubles
		addSceneEntry('start', noVersionbase+'scenes/start.js');		
		
		addSceneEntry('uberbar', noVersionbase+'scenes/uberbar.js');
	}
}());

