function makeArmyEvent(spec, x, y, z, planetId, watchType, time) {
	return {
		spec: spec,
		x: x,
		y: y,
		z: z,
		planetId: planetId,
		watchType: watchType,
		time: time
	};
}

function StatsReportData() {
	var self = this;
	self.armyCount = 0;
	self.metalIncome = 0;
	self.energyIncome = 0;
	self.metalStored = 0;
	self.energyStored = 0;
	self.metalProducedSinceLastTick = 0;
	self.energyProducedSinceLastTick = 0;
	self.metalWastedSinceLastTick = 0;
	self.energyWastedSinceLastTick = 0;
	self.metalIncomeNet = 0;
	self.energyIncomeNet = 0;
	self.metalSpending = 0;
	self.energySpending = 0;
	self.apm = 0;
}

function ReportData() {
	var self = this;
	self.ident = "";
	self.reporterUberName = "";
	self.reporterDisplayName = "";
	self.reporterTeam = 0;
	self.observedTeams = [];
	self.showLive = true;
	self.firstStats = new StatsReportData();
	self.version = reportVersion;
	self.planet = new ReportedPlanet();
	self.paVersion = "unknown";
	self.armyEvents = [];
}

function ReportTeam() {
	var self = this;
	self.index = 0;
	self.primaryColor = "";
	self.secondaryColor = "";
	self.players = [];
}

function ReportPlayer() {
	var self = this;
	self.displayName = ""
}

function ReportedPlanet() {
	var self = this;
	self.seed = 0;
	self.temperature = 0;
	self.water_height = 0;
	self.radius = 0;
	self.biome = "metal";
	self.planet_name = "unknown planet";
	self.height_range = 0;
}

function RunningGameData() {
	var self = this;
	self.gameLink = 0;
	self.stats = new StatsReportData();
	self.armyEvents = [];
}