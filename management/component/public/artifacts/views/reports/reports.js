application.views.AnalyticsLocalReports = Vue.extend({
	template: "#analyticsLocalReports",
	data: function() {
		return {
			reports: []
		}
	},
	created: function() {
		var reports = window.localStorage.nabuAnalyticReports;
		if (reports) {
			nabu.utils.arrays.merge(this.reports, JSON.parse(reports));
		}
	},
	methods: {
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
		}
	}
});