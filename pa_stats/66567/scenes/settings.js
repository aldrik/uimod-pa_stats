(function() {
	 $("#main .header").children(":first").append("<li><a href='#tab_pa_stats' data-toggle='pill'>PA Stats</a></li>");
     $("#main .content").children(":first").append('<div class="option-list tab-pane" id="tab_pa_stats"></div>');	
	
	function PaStatsSettingsModel() {
		var self = this;
		self.wantsToSend = ko.observable(decode(localStorage[paStatsGlobal.wantsToSendKey]));
		self.showDataLive = ko.observable(decode(localStorage[paStatsGlobal.showDataLiveKey]));
	}

	var paStatsSettingsModel = new PaStatsSettingsModel();

	var paStatsOldOk = model.save;
	model.save = function() {
		paStatsOldOk();
		localStorage[paStatsGlobal.wantsToSendKey] = encode(paStatsSettingsModel.wantsToSend());
		localStorage[paStatsGlobal.showDataLiveKey] = encode(paStatsSettingsModel.showDataLive());
	}

	var paStatsOldDefaults = model.restoreDefaults;
	model.restoreDefaults = function() {
		paStatsOldDefaults();
		paStatsSettingsModel.wantsToSend(true);
		paStatsSettingsModel.showDataLive(true);
	}

	$('#tab_pa_stats').load(paStatsBaseDir+"scenes/settings.html", function() {
		ko.applyBindings(paStatsSettingsModel, $('#tab_pa_stats').get(0));
	});
}());