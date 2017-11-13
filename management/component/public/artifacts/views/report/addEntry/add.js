application.views.AnalyticsReportAddEntry = Vue.extend({
	template: "#analyticsReportAddEntry",
	data: function() {
		return {
			type: null,
			subType: null,
			name: null,
			description: null,
			valid: false,
			drillDown: null,
			drillDownParameters: [],
			clickThrough: null
		};
	},
	computed: {
		reportsWithInput: function() {
			var reports = [];
			for (var i = 0; i < this.$services.analytics.reports.local.reports.length; i++) {
				if (this.$services.analytics.reports.local.reports[i].parameters && this.$services.analytics.reports.local.reports[i].parameters.length) {
					reports.push(this.$services.analytics.reports.local.reports[i]);
				}
			}
			return reports;
		},
		routes: function() {
			var routes = [];
			for (var i = 0; i < this.$services.router.router.routes.length; i++) {
				routes.push(this.$services.router.router.routes[i].alias);
			}
			return routes;
		}
	},
	methods: {
		create: function() {
			this.$resolve({
				name: this.name,
				description: this.description,
				created: new Date().toISOString(),
				type: this.type,
				subType: this.subType,
				drillDown: this.drillDown,
				drillDownParameters: this.drillDownParameters,
				clickThrough: this.clickThrough,
				data: []
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	},
	watch: {
		drillDown: function(newValue) {
			for (var i = 0; i < this.reportsWithInput.length; i++) {
				if (this.reportsWithInput[i].name == newValue) {
					for (var j = 0; j < this.reportsWithInput[i].parameters.length; j++) {
						this.drillDownParameters.push({
							key: this.reportsWithInput[i].parameters[j].key,
							value: null
						});
					}
				}
			}
		}
	}
});