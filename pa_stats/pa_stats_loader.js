// base URL for webservices
var paStatsHost = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? "http://127.0.0.1:8080/" : "http://ns393951.ip-176-31-115.eu/";
// location of mod files
var paStatsBaseDir = typeof statsDevelopmentNeverUseThisNameAnywhereElseIDareYou != 'undefined' ? 'coui://pa_stats/' : 'http://ns393951.ip-176-31-115.eu/mod/live/';

(function() {
	if (typeof paStatsGlobal === 'undefined') {
		
		// the version is only cached in the session storage
		// the files that are loaded for the start scene directly after the game started are loaded before the game version can be known to the mod
		// so wait until the version is put into the session storage and trigger a full scene reload.
		// this results in a bit of extra flicker on the game start, but it is the only way to get the start scene to be knowledgable about the version of PA
		if (window.location.href.indexOf("start.html") !== -1 && sessionStorage['build_version'] === undefined) {
			var recheckVersionSoon = function() {
				if (sessionStorage['build_version'] !== undefined && 
						(!(model.hasCmdLineTicket() || model.useSteam()) || model.inMainMenu() && model.hasUberNetRegion() && model.signedInToUbernet())) {
					api.game.debug.reloadScene(api.Panel.pageId);
				} else {
					window.setTimeout(recheckVersionSoon, 1000);
				}
			};
			recheckVersionSoon();
			return;
		}

		if (window.location.href.indexOf("start.html") !== -1 && sessionStorage['build_version']) {
			var fixIt = function() {
				if (model) {
					var wasLoggedIn = decode(sessionStorage['signed_in_to_ubernet']) === true;
					model.signedInToUbernet.subscribe(function(v) {
						window.setTimeout(function() {
							if (model.hasCmdLineTicket() || model.useSteam()) {
								model.signedInToUbernet(true);
							} else {
								if (v === false) {
									model.signedInToUbernet(wasLoggedIn);	
								}
							}
						}, 10);
					});
					// need to request this again for mods that parse --username
					engine.call('request_setup_info');
				} else {
					window.setTimeout(fixIt, 500);
				}
			};
			window.setTimeout(fixIt, 500);
		}
		
		var validatedPublicVersions = ["63475", "64498"];
		var version = decode(sessionStorage['build_version']);
		
		if (validatedPublicVersions.indexOf(version) === -1) {
			version = "unknown_version";
		}
		paStatsBaseDir = paStatsBaseDir + version + "/";
		
		var b = paStatsBaseDir;
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
		var c = b+'lib/captureLobbyId.js';
		scene_mod_list['server_browser'].push(b+"scenes/ranked_matcher/server_browser.js");
		scene_mod_list['start'].push(b+"scenes/ranked_matcher/start.js");
		scene_mod_list['connect_to_game'].push(c);
		scene_mod_list['server_browser'].push(b+"scenes/server_browser.js");
		scene_mod_list['new_game'].push(b+"scenes/new_game.js");
		scene_mod_list['game_over'].push(b+'scenes/game_over.js');
		scene_mod_list['live_game'].push(b+'lib/alertsManager.js');
		scene_mod_list['live_game'].push(b+'scenes/live_game.js');
		scene_mod_list['lobby'].push(b+'scenes/lobby.js');
		scene_mod_list['start'].push(b+'scenes/start.js');
		scene_mod_list['settings'].push(b+'scenes/settings.js');
		if (scene_mod_list['uberbar'] === undefined) {
			scene_mod_list['uberbar'] = [];
		}
		scene_mod_list['uberbar'].push(b+'scenes/uberbar.js');
	}
}());

