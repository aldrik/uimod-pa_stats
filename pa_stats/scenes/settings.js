$('#game_settings ul').append('<li class="game_settings"><a href="#tab_pa_stats">PA Stats</a></li>');
$('#game_settings').append("<div class='div_settings' id='tab_pa_stats'></div>");

function PaStatsSettingsModel() {
	var self = this;
	self.wantsToSend = ko.observable(decode(localStorage[wantsToSendKey]));
	self.showDataLive = ko.observable(decode(localStorage[showDataLiveKey]));
	
	self.knownUnitTypes = ko.observableArray();
	self.knownUnits = ko.observableArray();
	self.showCreatedAlerts = ko.observableArray(decode(localStorage[showCreatedAlerts]));
	self.showDestroyedAlerts = ko.observableArray(decode(localStorage[showDestroyedAlerts]));
	self.includeUnitSpecAlertsCreated = ko.observableArray(decode(localStorage[includedUnitSpecAlertsCreated]));
	self.excludedUnitSpecAlertsCreated = ko.observableArray(decode(localStorage[excludedUnitSpecAlertsCreated]));
	self.includeUnitSpecAlertsDestroyed = ko.observableArray(decode(localStorage[includedUnitSpecAlertsDestroyed]));
	self.excludedUnitSpecAlertsDestroyed = ko.observableArray(decode(localStorage[excludedUnitSpecAlertsDestroyed]));

	self.unitNameMap = undefined;
	self.renderUnit = function(unit) {
		return self.unitNameMap[unit];
	}
	
	loadUnitTypesArray(function(types) {
		self.knownUnitTypes(types);
		self.knownUnitTypes.sort();
	});
}

var paStatsSettingsModel = new PaStatsSettingsModel();

var paStatsOldOk = model.ok;
model.ok = function() {
	paStatsOldOk();
	localStorage[wantsToSendKey] = encode(paStatsSettingsModel.wantsToSend());
	localStorage[showDataLiveKey] = encode(paStatsSettingsModel.showDataLive());
	localStorage[showCreatedAlerts] = encode(paStatsSettingsModel.showCreatedAlerts());
	localStorage[showDestroyedAlerts] = encode(paStatsSettingsModel.showDestroyedAlerts());
	localStorage[includedUnitSpecAlertsCreated] = encode(paStatsSettingsModel.includeUnitSpecAlertsCreated());
	localStorage[excludedUnitSpecAlertsCreated] = encode(paStatsSettingsModel.excludedUnitSpecAlertsCreated());
	localStorage[includedUnitSpecAlertsDestroyed] = encode(paStatsSettingsModel.includeUnitSpecAlertsDestroyed());
	localStorage[excludedUnitSpecAlertsDestroyed] = encode(paStatsSettingsModel.excludedUnitSpecAlertsDestroyed());
}

var paStatsOldDefaults = model.defaults;
model.defaults = function() {
	paStatsOldDefaults();
	paStatsSettingsModel.wantsToSend(true);
	paStatsSettingsModel.showDataLive(true);
	paStatsSettingsModel.includeUnitSpecAlertsCreated(["Factory"]); 
	paStatsSettingsModel.excludedUnitSpecAlertsCreated(["Structure"]); 
	paStatsSettingsModel.includeUnitSpecAlertsDestroyed([]); 
	paStatsSettingsModel.excludedUnitSpecAlertsDestroyed([]); 
}

$('#tab_pa_stats').load(paStatsBaseDir+"scenes/settings.html", function() {
	loadUnitNamesMapping(function(nameMap) {
		paStatsSettingsModel.unitNameMap = nameMap;
		for (u in nameMap) {
			paStatsSettingsModel.knownUnits.push(u);
		}
		paStatsSettingsModel.knownUnits.sort(function(left, right) {
			return nameMap[left] == nameMap[right] ? 0 : (nameMap[left] < nameMap[right] ? -1 : 1);
		});
		ko.applyBindings(paStatsSettingsModel, $('#tab_pa_stats').get(0));
	});
});