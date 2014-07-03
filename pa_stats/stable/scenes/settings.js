(function() {
	function PaStatsSettingsModel() {
		var self = this;
		var oldWantsToSend = ko.observable();
		var oldShowDataLive = ko.observable();
		
		self.reloadCleanState = function() {
			oldWantsToSend(decode(localStorage[paStatsGlobal.wantsToSendKey]));
			oldShowDataLive(decode(localStorage[paStatsGlobal.showDataLiveKey]));
		};
		
		self.reloadCleanState();
		
		self.wantsToSend = ko.observable(oldWantsToSend());
		self.showDataLive = ko.observable(oldShowDataLive());
		
		self.dirty = ko.computed(function() {
			return self.wantsToSend() !== oldWantsToSend() ||
				self.showDataLive() !== oldShowDataLive();
		});
	}

	var paStatsSettingsModel = new PaStatsSettingsModel();

	model.paStatsSettingsModel = paStatsSettingsModel;
	
	var oldClean = model.clean;
	model.clean = ko.computed(function() {
		return oldClean() && !model.paStatsSettingsModel.dirty();
	});
	
	var doStore = function() {
		paStatsOldOk();
		localStorage[paStatsGlobal.wantsToSendKey] = encode(paStatsSettingsModel.wantsToSend());
		localStorage[paStatsGlobal.showDataLiveKey] = encode(paStatsSettingsModel.showDataLive());
		paStatsSettingsModel.reloadCleanState();
	};
	
	var paStatsOldOk = model.save;
	model.save = function() {
		paStatsOldOk();
		doStore();
	};
	
	var paStatsOldOkClose = model.saveAndExit;
	model.saveAndExit = function() {
		paStatsOldOkClose();
		doStore();
	};
	
	var paStatsOldDefaults = model.restoreDefaults;
	model.restoreDefaults = function() {
		paStatsOldDefaults();
		paStatsSettingsModel.wantsToSend(true);
		paStatsSettingsModel.showDataLive(true);
	};
	
	model.settingGroups().push("pastats");
    model.settingDefinitions()["pastats"] = {title:"PA Stats",settings:{}};
	$("#main .content .wrapper .option-list").first().append($('<div>').load(paStatsBaseDir+"scenes/settings.html", function () {
		model.settingGroups.notifySubscribers();
	}));
}());