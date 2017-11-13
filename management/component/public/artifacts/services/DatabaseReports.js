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
		},
		actions: function() {
			var actions = [];
			var self = this;
			var pushIt = function(report) {
				actions.push({
					title: report.name,
					dynamic: true,
					handler: function() {
						self.$services.router.route("analyticsDatabaseReport", { name: report.name });
					}
				});
			}
			for (var i = 0; i < this.reports.length; i++) {
				pushIt(this.reports[i]);
			}
			return actions;
		}
	},
	activate: function(done) {
		this.load().then(function() {
			done();
		}, function() {
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
		},
		actions: function(newValue) {
			var menu = this.$services.manager.findMenu("Analytics");
			if (menu) {
				for (var i = menu.actions.length - 1; i >= 0; i--) {
					if (menu.actions[i].dynamic) {
						menu.actions.splice(i, 1);
					}
				}
				nabu.utils.arrays.merge(menu.actions, newValue);
			}
		}
	}
}), { name: "nabu.analytics.DatabaseReports", lazy: true });