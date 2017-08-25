application.views.AnalyticsLocalReports = Vue.extend({
	template: "#analyticsLocalReports",
	data: function() {
		return {
			reports: [],
			databaseReports: []
		}
	},
	created: function() {
		var reports = window.localStorage.nabuAnalyticReports;
		if (reports) {
			nabu.utils.arrays.merge(this.reports, JSON.parse(reports));
		}
	},
	activate: function(done) {
		if (this.connection) {
			this.loadDatabaseReports(done);
		}
		else {
			done();
		}
	},
	computed: {
		connection: function() {
			return this.$services.manager.connection();
		}	
	},
	methods: {
		loadDatabaseReports: function(done) {
			this.databaseReports.splice(0, this.databaseReports.length);
			var self = this;
			this.$services.swagger.execute("nabu.reporting.analytics.management.rest.report.list", {connectionId: this.connection}).then(function(reportList) {
				if (reportList.reports) {
					nabu.utils.arrays.merge(self.databaseReports, reportList.reports);
				}
				if (done) {
					done();
				}
			});
		},
		addReport: function() {
			var self = this;
			this.$prompt(function() {
				return new application.views.AnalyticsLocalReportCreate({ data: { reports: self.reports }});
			}).then(function(report) {
				// push to component
				self.reports.push(report);
				// push to storage
				var reports = window.localStorage.nabuAnalyticReports;
				if (reports) {
					reports = JSON.parse(reports);	
				}
				else {
					reports = [];
				}
				reports.push(report);
				window.localStorage.nabuAnalyticReports = JSON.stringify(reports);
			});
		},
		deleteReport: function(report) {
			var reports = window.localStorage.nabuAnalyticReports;
			if (reports) {
				reports = JSON.parse(reports);
				for (var i = 0; i < reports.length; i++) {
					if (reports[i].name == report.name) {
						reports.splice(i, 1);
						break;
					}
				}
				window.localStorage.nabuAnalyticReports = JSON.stringify(reports);
			}
			var index = this.reports.indexOf(report);
			this.reports.splice(index, 1);
		},
		deleteDatabaseReport: function(report) {
			
		},
		merge: function(report) {
			// we try to find the report in the current database reports
			var current = null;
			var index = -1;
			for (var i = 0; i < this.databaseReports.length; i++) {
				if (this.databaseReports[i].name == report.name) {
					current = this.databaseReports[i];
					index = i;
					break;
				}
			}
			if (!current) {
				current = {
					name: report.name
				}
			}
			var self = this;
			current.description = report.description;
			current.report = JSON.stringify(report);
			this.$services.swagger.execute("nabu.reporting.analytics.management.rest.report.merge", { body: current, connectionId: this.connection }).then(function(result) {
				if (index >= 0) {
					nabu.utils.objects.merge(self.databaseReports[index], result);
				}
				else {
					self.databaseReports.push(result);
				}
			});
		},
		storeLocal: function(report) {
			report = JSON.parse(report.report);
			var reports = window.localStorage.nabuAnalyticReports;
			if (reports) {
				reports = JSON.parse(reports);
			}
			else {
				reports = [];
			}
			var index = -1;
			for (var i = 0; i < reports.length; i++) {
				if (reports[i].name == report.name) {
					index = i;
					break;
				}
			}
			if (i < 0) {
				reports.push(report);
			}
			else {
				reports[i] = report;
			}
			window.localStorage.nabuAnalyticReports = JSON.stringify(reports);
		}
	},
	watch: {
		connection: function() {
			this.loadDatabaseReports();
		}
	}
});