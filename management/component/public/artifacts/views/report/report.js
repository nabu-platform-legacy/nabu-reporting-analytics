application.views.AnalyticsReport = Vue.extend({
	template: "#analyticsReport",
	data: function() {
		return {
			report: null,
			editing: false,
			editable: true,
			values: [],
			type: "database",
			activating: true,
			timer: null
		}
	},
	activate: function(done) {
		this.activating = true;
		// set all the values that are passed in
		if (this.values) {
			for (var i = 0; i < this.values.length; i++) {
				if (i >= this.report.parameters.length) {
					break;
				}
				this.report.parameters[i].value = this.values[i];
			}
		}
		// set standard values for new fields
		if (this.report && typeof(this.report.parameters) == "undefined") {
			Vue.set(this.report, "parameters", []);
		}
		this.mapBound(this.report.parameters);
		if (this.report && this.report.rows) {
			this.reloadAll().then(function() {
				done();
			}, function() {
				done();
			});
		}
		else {
			done();
		}
	},
	beforeDestroy: function(component) {
		if (component.timer != null) {
			clearTimeout(component.timer);
		}
	},
	computed: {
		route: function() {
			return "analytics" + this.type.substring(0, 1).toUpperCase() + this.type.substring(1) + "Report";
		}	
	},
	ready: function() {
		this.activating = false;
		var self = this;
		new Clipboard(this.$refs.copier, {
			text: function(trigger) {
				return JSON.stringify(self.report);
			}
		});
		this.$el.addEventListener("paste", function(event) {
			if (self.editing) {
				var data = event.clipboardData.getData("text/plain");
				if (data) {
					var parsed = JSON.parse(data);
					if (parsed && parsed.rows) {
						self.$confirm({ 
							message: 'Are you sure you want to add the data to this report?', 
							type: 'question', 
							ok: 'Add'
						}).then(function() {
							nabu.utils.arrays.merge(self.report.rows, parsed.rows);
						});
					}
				}
			}
		});
		this.autoReload();
	},
	methods: {
		autoReload: function() {
			var self = this;
			self.timer = setTimeout(function() {
				if (self.report && self.report.rows) {
					self.reloadAll().then(function() {
						self.autoReload();
					})
				}
				else {
					self.autoReload();
				}
			}, 10000);
		},
		reloadAll: function() {
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
						if (typeof(entry.showDots) == "undefined") {
							Vue.set(entry, "showDots", true);
						}
						if (typeof(entry.angleLabels) == "undefined") {
							Vue.set(entry, "angleLabels", false);
						}
						if (typeof(entry.formatter) == "undefined") {
							Vue.set(entry, "formatter", null);
						}
						if (typeof(entry.drillDownValue) == "undefined") {
							Vue.set(entry, "drillDownValue", false);
						}
						if (typeof(entry.colorize) == "undefined") {
							Vue.set(entry, "colorize", false);
						}
						if (entry.data) {
							nabu.utils.arrays.merge(inputs, entry.data);
						}
					}
				}
			}
			// get new data for everything
			return this.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: inputs }}).then(function(resultSetList) {
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
			});
		},
		generateRoute: function(entry) {
			var route = { parameters: {} };
			route.alias = entry.subType;
			for (var i = 0; i < this.report.parameters.length; i++) {
				route.parameters[this.report.parameters[i].key] = this.report.parameters[i].value;
			}
			return route;
		},
		isGood: function(value) {
			value = parseFloat(value);
			if (!isNaN(value)) {
				if (value > 0) {
					return true;
				}
			}
			return false;
		},
		isBad: function(value) {
			value = parseFloat(value);
			if (!isNaN(value)) {
				if (value < 0) {
					return true;
				}
			}
			return false;
		},
		drillDown: function(entry, data) {
			if (entry.drillDown) {
				// Object.keys(data).map(function(x) { return data[x] })
				this.$services.router.route(this.route, { name: entry.drillDown, values: [data[Object.keys(data)[0]]] });
			}
		},
		toggleFilter: function(entry, value) {
			if (typeof(entry.showFilter) == "undefined") {
				Vue.set(entry, "showFilter", typeof(value) == "undefined" ? true : value);
			}
			else {
				entry.showFilter = typeof(value) == "undefined" ? !entry.showFilter : value;
			}
		},
		addRow: function() {
			if (!this.report.rows) {
				Vue.set(this.report, "rows", []);
			}
			this.report.rows.push({
				entries: []
			});
		},
		shiftRow: function(report, row, amount) {
			var index = report.rows.indexOf(row);
			var other = index + amount;
			if (other >= 0 && other < report.rows.length) {
				report.rows.splice(index, 1, report.rows[other]);
				report.rows.splice(other, 1, row);
			}
		},
		shiftEntry: function(row, entry, amount) {
			var index = row.entries.indexOf(entry);
			var other = index + amount;
			if (other >= 0 && other < row.entries.length) {
				row.entries.splice(index, 1, row.entries[other]);
				row.entries.splice(other, 1, entry);
			}
		},
		isHidden: function(data, name) {
			if (data.hide) {
				for (var i = 0; i < data.hide.length; i++) {
					if (data.hide[i].key == name) {
						return data.hide[i].hide;
					}
				}
			}
			return false;
		},
		addEntry: function(row) {
			this.$prompt(function() {
				return new application.views.AnalyticsReportAddEntry({ data: { reports: this.reports }});
			}).then(function(entry) {
				if (!row.entries) {
					Vue.set(row, "entries", []);
				}
				row.entries.push(entry);
			});
		},
		addDataSource: function(entry, clear, limited) {
			var self = this;
			if (typeof(limited) == "undefined") {
				limited = clear;
			}
			return this.$prompt(function() {
				return new application.views.AnalyticsReportAddDataSource({ data: { type: entry.type, subType: entry.subType, named: !clear, limited: limited, reportProperties: self.report.parameters }});
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
		refresh: function(entry) {
			if (entry.data) {
				return this.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: entry.data }}).then(function(resultSetList) {
					for (var i = 0; i < entry.data.length; i++) {
						entry.data[i].resultSet = resultSetList.resultSets[i];
					}
				});
			}
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
		},
		deleteProperty: function(property) {
			this.report.parameters.splice(this.report.parameters.indexOf(property), 1);
		},
		amountOfBound(data) {
			var total = 0;
			var bound = data.boundParameters.map(function(x) { return x.value });
			for (var i = 0; i < data.parameters.length; i++) {
				if (bound.indexOf(data.parameters[i].key) >= 0) {
					total++;
				}
			}
			return total;
		},
		isBound: function(entry, property) {
			if (entry.data[0].boundParameters) {
				for (var i = 0; i < entry.data[0].boundParameters.length; i++) {
					if (entry.data[0].boundParameters[i].value == property.key) {
						return true;
					}
				}
			}
			return false;
		},
		addProperty: function() {
			var self = this;
			return this.$prompt(function() {
				return new application.views.AnalyticsReportAddProperty();
			}).then(function(property) {
				self.report.parameters.push(property);
			});
		},
		mapBound: function(newValue) {
			var map = {};
			var affected = [];
			for (var i = 0; i < newValue.length; i++) {
				map[newValue[i].key] = newValue[i].value;
			}
			for (var i = 0; i < this.report.rows.length; i++) {
				var row = this.report.rows[i];
				for (var j = 0; j < row.entries.length; j++) {
					var entry = row.entries[j];
					for (var k = 0; k < entry.data.length; k++) {
						var data = entry.data[k];
						if (data.boundParameters) {
							for (var l = 0; l < data.boundParameters.length; l++) {
								var bound = data.boundParameters[l];
								for (var m = 0; m < data.parameters.length; m++) {
									var parameter = data.parameters[m];
									if (parameter.key == bound.value && parameter.value != map[bound.key]) {
										parameter.value = map[bound.key];
										if (affected.indexOf(data) < 0) {
											affected.push(data);
										}
									}
								}
							}
						}
					}
				}
			}
			return affected;
		},
		deleteRow: function(row) {
			var self = this;
			this.$confirm({
				message: "Are you sure you want to delete this row?",
				ok: "Delete",
				type: "info"
			}).then(function() {
				var index = self.report.rows.indexOf(row);
				self.report.rows.splice(index, 1);
			});
		},
		update: function() {
			var affected = this.mapBound(this.report.parameters);
			return this.$services.swagger.execute("nabu.reporting.analytics.management.rest.execute", { body: { dataSets: affected }}).then(function(resultSetList) {
				for (var i = 0; i < affected.length; i++) {
					affected[i].resultSet = resultSetList.resultSets[i];
				}
			});
		}
	}
});