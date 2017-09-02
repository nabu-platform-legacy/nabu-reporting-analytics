nabu.services.VueService(Vue.extend({
	data: function() {
		return {
			reports: []
		}
	},
	mixins: [nabu.mixins.analytics.Report],
	computed: {
		connection: function() {
			return this.$services.manager.connection();
		}
	},
	activate: function(done) {
		this.load().then(function() {
			done();
		});
	},
	methods: {
		delete: function(report) {
			var self = this;
			this.$services.swagger.execute("nabu.reporting.analytics.management.rest.report.delete", { connectionId: this.connection, reportId: report.id }).then(function() {
				var index = self.reports.indexOf(report);
				self.reports.splice(index, 1);
			});
		},
		load: function() {
			this.reports.splice(0, this.reports.length);
			var self = this;
			return this.$services.swagger.execute("nabu.reporting.analytics.management.rest.report.list", { connectionId: this.connection }).then(function(reportList) {
				if (reportList.reports) {
					nabu.utils.arrays.merge(self.reports, reportList.reports);
				}
			});
		},
		// merge a report to the database
		save: function(report) {
			// we try to find the report in the current database reports
			var current = null;
			var index = -1;
			for (var i = 0; i < this.reports.length; i++) {
				if (this.reports[i].name == report.name) {
					current = this.reports[i];
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
					nabu.utils.objects.merge(self.reports[index], result);
				}
				else {
					self.reports.push(result);
				}
			});
		}
	},
	watch: {
		connection: function() {
			this.load();
		}
	}
}), { name: "nabu.analytics.DatabaseReports", lazy: true });