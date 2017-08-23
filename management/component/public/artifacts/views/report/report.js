application.views.AnalyticsReport = Vue.extend({
	template: "#analyticsReport",
	data: function() {
		return {
			report: null,
			name: null,
			editing: false
		}
	},
	activate: function(done) {
		var reports = window.localStorage.nabuAnalyticReports;
		if (reports) {
			reports = JSON.parse(reports);
			for (var i = 0; i < reports.length; i++) {
				if (reports[i].name == this.name) {
					this.report = reports[i];
					break;
				}
			}
		}
		if (this.report && this.report.rows) {
			var self = this;
			var inputs = [];
			for (var i = 0; i < this.report.rows.length; i++) {
				if (this.report.rows[i].entries) {
					for (var j = 0; j < this.report.rows[i].entries.length; j++) {
						var entry = this.report.rows[i].entries[j];
						if (typeof(entry.showAxisTitle) == "undefined") {
							Vue.set(entry, "showAxisTitle", false);
						}
						if (typeof(entry.showLegend) == "undefined") {
							Vue.set(entry, "showLegend", false);
						}
						if (entry.data) {
							nabu.utils.arrays.merge(inputs, entry.data);
						}
					}
				}
			}
			this.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: inputs }}).then(function(resultSetList) {
				var counter = 0;
				for (var i = 0; i < self.report.rows.length; i++) {
					if (self.report.rows[i].entries) {
						for (var j = 0; j < self.report.rows[i].entries.length; j++) {
							var entry = self.report.rows[i].entries[j];
							if (entry.data) {
								for (var k = 0; k < entry.data.length; k++) {
									entry.data[k].resultSet = resultSetList.resultSets[counter++];
								}
							}
						}
					}
				}
				done();
			});
		}
		else {
			done();
		}
	},
	ready: function() {
		var self = this;
		new Clipboard(this.$refs.copier, {
			text: function(trigger) {
				return JSON.stringify(self.report);
			}
		});
	},
	methods: {
		addRow: function() {
			if (!this.report.rows) {
				Vue.set(this.report, "rows", []);
			}
			this.report.rows.push({
				entries: []
			});
		},
		addEntry: function(row) {
			this.$prompt(function() {
				return new application.views.AnalyticsReportAddEntry();
			}).then(function(entry) {
				if (!row.entries) {
					Vue.set(row, "entries", []);
				}
				row.entries.push(entry);
			});
		},
		addDataSource: function(entry, clear) {
			var self = this;
			return this.$prompt(function() {
				return new application.views.AnalyticsReportAddDataSource({ data: { type: entry.type, named: !clear }});
			}).then(function(source) {
				if (!entry.data) {
					Vue.set(entry, "data", []);
				}
				else if (clear) {
					entry.data.splice(0, entry.data.length);
				}
				entry.data.push(source);
				self.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: [source] }}).then(function(resultSetList) {
					source.resultSet = resultSetList.resultSets[0];
				});
			});
		},
		loadPage: function(data, page, force) {
			var offset = data.limit * page;
			if (offset != data.offset || force) {
				data.offset = offset;
				return this.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: [data] }}).then(function(resultSetList) {
					data.resultSet = resultSetList.resultSets[0];
				});
			}
			else {
				var promise = this.$services.q.defer();
				promise.resolve();
				return promise;
			}
		},
		save: function() {
			var reports = JSON.parse(window.localStorage.nabuAnalyticReports);
			for (var i = 0; i < reports.length; i++) {
				if (reports[i].name == this.report.name) {
					reports[i] = this.report;
					this.editing = false;
					break;
				}
			}
			window.localStorage.nabuAnalyticReports = JSON.stringify(reports);
		},
		cancel: function() {
			var reports = JSON.parse(window.localStorage.nabuAnalyticReports);
			for (var i = 0; i < reports.length; i++) {
				if (reports[i].name == this.report.name) {
					Vue.set(this, "report", reports[i]);
					this.editing = false;
					break;
				}
			}
		},
		sort: function(data, field) {
			if (data.orderBy.indexOf(field) >= 0) {
				data.orderBy = [field + " desc"];
			}
			else if (data.orderBy.indexOf(field + " desc") >= 0) {
				data.orderBy = [];
			}
			else {
				data.orderBy = [field];
			}
			this.loadPage(data, 0, true);
		}
	}
});