$('#game_settings ul').append('<li class="game_settings"><a href="#tab_pa_stats">PA Stats</a></li>');
$('#game_settings').append("<div class='div_settings' id='tab_pa_stats'></div>");

function PaStatsSettingsModel() {
	var self = this;
	self.wantsToSend = ko.observable(decode(localStorage[wantsToSendKey]));
	self.showDataLive = ko.observable(decode(localStorage[showDataLiveKey]));
}

var paStatsSettingsModel = new PaStatsSettingsModel();

var paStatsOldOk = model.ok;
model.ok = function() {
	paStatsOldOk();
	localStorage[wantsToSendKey] = encode(paStatsSettingsModel.wantsToSend());
	localStorage[showDataLiveKey] = encode(paStatsSettingsModel.showDataLive());
}

var paStatsOldDefaults = model.defaults;
model.defaults = function() {
	paStatsOldDefaults();
	paStatsSettingsModel.wantsToSend(true);
	paStatsSettingsModel.showDataLive(true);
}

$('#tab_pa_stats').load(paStatsBaseDir+"scenes/settings.html", function() {
	ko.applyBindings(paStatsSettingsModel, $('#tab_pa_stats').get(0));
});