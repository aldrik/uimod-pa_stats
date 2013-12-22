var paStatsBaseDir = typeof statsDevelopment != 'undefined' ? '../../mods/pa_stats/' : 'http://nanodesu.info/stuff/pa/mods/live/pastats/'; 
if (typeof checkPaStatsVersion === 'undefined') {
	var b = paStatsBaseDir;
	loadScript(b+'scenes/global.js');
	loadScript(b+'lib/report_data.js')
	var c = b+'lib/captureLobbyId.js';
	scene_mod_list['connect_to_game'].push(c);
	scene_mod_list['server_browser'].push(c);
	scene_mod_list['new_game'].push(c);
	scene_mod_list['game_over'].push(b+'scenes/game_over.js');
	scene_mod_list['live_game'].push(b+'lib/unitTypes.js');
	scene_mod_list['live_game'].push(b+'scenes/live_game.js');
	scene_mod_list['lobby'].push(b+'scenes/lobby.js');
	scene_mod_list['start'].push(b+'scenes/start.js');
	scene_mod_list['settings'].push(b+'scenes/settings.js');
}