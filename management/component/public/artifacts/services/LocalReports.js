nabu.services.VueService(Vue.extend({
	data: function() {
		return {
			reports: []
		}
	},
	created: function() {
		this.load();
	},
	mixins: [nabu.mixins.analytics.Report],
	methods: {
		load: function() {
			var reports = window.localStorage.nabuAnalyticReports;
			if (reports) {
				nabu.utils.arrays.merge(this.reports, JSON.parse(reports));
			}
		},
		save: function(report) {
			report = JSON.parse(report.report);
			var index = -1;
			for (var i = 0; i < this.reports.length; i++) {
				if (this.reports[i].name == report.name) {
					index = i;
					break;
				}
			}
			if (index < 0) {
				this.reports.push(report);
			}
			else {
				this.reports[index] = report;
			}
			window.localStorage.nabuAnalyticReports = JSON.stringify(this.reports);
		},
		create: function() {
			var self = this;
			this.$prompt(function() {
				return new application.views.AnalyticsReportCreate({ data: { reports: self.reports }});
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
		delete: function(report) {
			// remove from local storage
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
			// remove from component
			var index = this.reports.indexOf(report);
			this.reports.splice(index, 1);
		}
	}
}), { name: "nabu.analytics.LocalReports", lazy: true });