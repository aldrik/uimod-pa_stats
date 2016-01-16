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
	
	var currentSceneName = window.location.pathname.split("/").pop().replace(".html", "");
	
	console.log( 'PA Stats current scene is ' + currentSceneName );
	
	var b = paStatsBaseDir;
	
	// due to the ordering of things this needs to be loaded where scene mods are loaded, but for all scenes.
//	addSceneEntry(currentSceneName, b+'lib/ajax_ubernet.js');

	// PA Chat
	
	var paChatLoaded = false;
	
	_.forEach( scene_mod_list.uberbar, function( entry )
	{
		if ( entry.indexOf( '/mods/pachat/uberbar.js' ) != -1 )
		{
			paChatLoaded = true;
			return false;
		}
	});
	
	if ( paChatLoaded )
	{
		if ( currentSceneName == 'uberbar' )
		{
			console.log( 'PA Chat already loaded before PA Stats' );
		}
	}
	else
	{
		addSceneEntry('uberbar', "https://dfpsrd4q7p23m.cloudfront.net/mods/gOptimiseUserTagMap/ui/mods/gOptimiseUserTagMap/uberbar.js");
		addSceneEntry('uberbar', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/jabber.js");
		addSceneEntry('uberbar', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/uberbar.css");
		addSceneEntry('uberbar', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/uberbar.js");
		
		addSceneEntry('live_game_options_bar', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/live_game_options_bar.css");
		addSceneEntry('live_game_options_bar', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/live_game_options_bar.js");
	
		addSceneEntry('start', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/start.js");
		addSceneEntry('matchmaking', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/matchmaking.js");
		addSceneEntry('leaderboard', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/leaderboard.js");
		addSceneEntry('new_game_ladder', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/new_game_ladder.js");
		addSceneEntry('server_browser', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/server_browser.js");
		addSceneEntry('new_game', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/new_game.js");
		addSceneEntry('live_game', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/live_game.js");
		addSceneEntry('replay_browser', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/replay_browser.js");
		addSceneEntry('system_editor', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/system_editor.js");
		addSceneEntry('load_planet', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/load_planet.js");
		addSceneEntry('settings', "https://dfpsrd4q7p23m.cloudfront.net/mods/pachat/settings.js");
	}
	
	// End of PA Chat

	
	if (typeof paStatsGlobal === 'undefined') {
		loadScript(b+'lib/unitInfoParser.js');
		loadScript(b+'scenes/global.js');
	}
	
	addSceneEntry('connect_to_game', b+'lib/captureLobbyId.js');
	addSceneEntry('connect_to_game', b+'scenes/connect.js');
	addSceneEntry('server_browser', b+"scenes/server_browser.js");
	
	addSceneEntry('new_game_ladder', b+"scenes/new_game_ladder.js");
	addSceneEntry('new_game', b+"scenes/new_game.js");
	addSceneEntry('game_over', b+'scenes/game_over.js');
	
	addSceneEntry('matchmaking', b+'scenes/matchmaking.js');
	
	addSceneEntry('live_game', b+'lib/alertsManager.js');
	addSceneEntry('live_game', b+'scenes/live_game.js');
	
	//addSceneEntry('lobby', b+'scenes/lobby.js');
	addSceneEntry('settings', b+'scenes/settings.js');
	
	addSceneEntry('live_game_time_bar', b+"lib/alertsManager.js");
	addSceneEntry("live_game_unit_alert", b+'lib/alertsManager.js');
	addSceneEntry("live_game_message", b+"scenes/live_game_message.js");
	addSceneEntry('gw_start', b+'scenes/gw_start.js');
	
	addSceneEntry('start', b+'scenes/start.js');		
	
	addSceneEntry('uberbar', b+'scenes/uberbar.js');
}());