application.views.AnalyticsReportAddEntry = Vue.extend({
	template: "#analyticsReportAddEntry",
	data: function() {
		return {
			type: null,
			subType: null,
			name: null,
			description: null,
			valid: false,
			drillDown: null
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
				data: []
			});
		},
		validate: function() {
			var messages = this.$refs.form.validate();
			this.valid = messages.length == 0;
		}
	}
});